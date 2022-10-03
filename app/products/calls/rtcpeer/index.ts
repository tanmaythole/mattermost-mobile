// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable @typescript-eslint/ban-ts-comment */

import {EventEmitter} from 'events';

import {
    MediaStream,
    MediaStreamTrack,
    RTCDataChannel,
    RTCPeerConnection,
    RTCRtpSender,
    RTCSessionDescription,
} from 'react-native-webrtc';
import RTCTrackEvent from 'react-native-webrtc/lib/typescript/RTCTrackEvent';

import {
    RTCPeerConfig, RTCPeerConnectionIceEvent,
} from './types';

const rtcConnFailedErr = new Error('rtc connection failed');

export default class RTCPeer extends EventEmitter {
    private pc: RTCPeerConnection | null;
    private readonly senders: { [key: string]: RTCRtpSender };
    private destroyCb?: () => void;
    private serverDC: RTCDataChannel;

    public connected: boolean;

    constructor(config: RTCPeerConfig, destroyCb?: () => void) {
        console.log('<><> RTCPeer constructor');
        super();

        // We keep a map of track IDs -> RTP sender so that we can easily
        // replace tracks when muting/unmuting.
        this.senders = {};

        this.pc = new RTCPeerConnection(config);

        // @ts-ignore
        this.pc.onnegotiationneeded = () => this.onNegotiationNeeded();

        // @ts-ignore
        this.pc.onicecandidate = (ev) => this.onICECandidate(ev);

        // @ts-ignore
        this.pc.oniceconnectionstatechange = () => this.onICEConnectionStateChange();

        // @ts-ignore
        this.pc.onconnectionstatechange = () => this.onConnectionStateChange();

        // @ts-ignore
        this.pc.ontrack = (ev) => this.onTrack(ev);

        this.connected = false;
        this.destroyCb = destroyCb;

        // We create a data channel for two reasons:
        // - Initiate a connection without preemptively add audio/video tracks.
        // - Use this communication channel for further negotiation (to be implemented).
        console.log('<><> creating data channel');
        this.serverDC = this.pc.createDataChannel('calls-dc');
        this.serverDC.onmessage = (msg) => {
            console.log('<><> received from serverDC:', msg);
        };

        setTimeout(() => {
            console.log('<><> sending data');
            this.serverDC.send('hi!');
        }, 3000);
    }

    private onICECandidate(ev: RTCPeerConnectionIceEvent) {
        console.log('<><> onICECandidate', ev.candidate);
        if (ev.candidate) {
            this.emit('candidate', ev.candidate);
        }
    }

    private onConnectionStateChange() {
        console.log('<><> onConnectionStateChange', this.pc?.connectionState);
        switch (this.pc?.connectionState) {
            case 'connected':
                this.connected = true;
                break;
            case 'failed':
                this.emit('close', rtcConnFailedErr);
                break;
        }
    }

    private onICEConnectionStateChange() {
        console.log('<><> onICEConnectionStateChange', this.pc?.iceConnectionState);
        switch (this.pc?.iceConnectionState) {
            case 'connected':
                this.emit('connect');
                break;
            case 'failed':
                this.emit('close', rtcConnFailedErr);
                break;
            case 'closed':
                this.emit('close');
                break;
            case 'checking':
                // FIXME: Force negotiation because it stalls here for some clients.
                console.log('<><> forcing negotiation');

                //this.onNegotiationNeeded();
                break;
            default:
        }
    }

    private async onNegotiationNeeded() {
        console.log('<><> onNegotiationNeeded');
        try {
            const desc = await this.pc?.createOffer({}) as RTCSessionDescription;
            await this.pc?.setLocalDescription(desc);
            this.emit('offer', this.pc?.localDescription);
        } catch (err) {
            this.emit('error', err);
        }
    }

    private onTrack(ev: RTCTrackEvent) {
        console.log('<><> onTrack', ev);
        if (ev.streams.length === 0) {
            this.emit('stream', new MediaStream([ev.track]));
            return;
        }
        this.emit('stream', ev.streams[0]);
    }

    public async signal(data: string) {
        console.log('<><> signal');
        if (!this.pc) {
            throw new Error('peer has been destroyed');
        }

        const msg = JSON.parse(data);
        console.log('<><> msg:', data);

        switch (msg.type) {
            case 'candidate':
                await this.pc.addIceCandidate(msg.candidate);
                break;
            case 'offer':
                try {
                    await this.pc.setRemoteDescription(new RTCSessionDescription(msg));
                    const answer = await this.pc.createAnswer() as RTCSessionDescription;
                    await this.pc.setLocalDescription(answer);
                    this.emit('answer', this.pc.localDescription);
                } catch (err) {
                    this.emit('error', err);
                }
                break;
            case 'answer':
                try {
                    await this.pc.setRemoteDescription(new RTCSessionDescription(msg));
                } catch (err) {
                    this.emit('error', err);
                }
                break;
            default:
                throw new Error('invalid signaling data received');
        }
    }

    public async addTrack(track: MediaStreamTrack, stream?: MediaStream) {
        console.log('<><> addTrack');
        if (!this.pc) {
            throw new Error('peer has been destroyed');
        }
        const sender = await this.pc.addTrack(track, [stream!]);
        if (sender) {
            this.senders[track.id] = sender;
        }
    }

    public addStream(stream: MediaStream) {
        stream.getTracks().forEach((track) => {
            this.addTrack(track, stream);
        });
    }

    public replaceTrack(oldTrackID: string, newTrack: MediaStreamTrack | null) {
        console.log('<><> replaceTrack');
        const sender = this.senders[oldTrackID];
        if (!sender) {
            throw new Error('sender for track not found');
        }
        if (newTrack && newTrack.id !== oldTrackID) {
            delete this.senders[oldTrackID];
            this.senders[newTrack.id] = sender;
        }
        sender.replaceTrack(newTrack);
    }

    public getStats() {
        if (!this.pc) {
            throw new Error('peer has been destroyed');
        }
        return this.pc.getStats();
    }

    public destroy() {
        console.log('<><> destroy');
        if (!this.pc) {
            throw new Error('peer has been destroyed already');
        }

        this.connected = false;
        this.removeAllListeners('candidate');
        this.removeAllListeners('connect');
        this.removeAllListeners('error');
        this.removeAllListeners('close');
        this.removeAllListeners('offer');
        this.removeAllListeners('answer');
        this.removeAllListeners('stream');

        // @ts-ignore
        this.pc.onnegotiationneeded = null;

        // @ts-ignore
        this.pc.onicecandidate = null;

        // @ts-ignore
        this.pc.oniceconnectionstatechange = null;

        // @ts-ignore
        this.pc.onconnectionstatechange = null;

        // @ts-ignore
        this.pc.ontrack = null;

        this.pc.close();
        this.pc = null;
        this.destroyCb?.();
    }
}
