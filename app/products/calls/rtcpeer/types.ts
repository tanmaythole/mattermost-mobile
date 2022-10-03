// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {RTCIceCandidate} from 'react-native-webrtc';

export type RTCPeerConfig = {
    iceServers: RTCIceServer[];
}

type RTCIceCredentialType = 'password';

export interface RTCIceServer {
    credential?: string;
    credentialType?: RTCIceCredentialType;
    urls: string | string[];
    username?: string;
}

export interface RTCPeerConnectionIceEvent extends Event {
    readonly candidate: RTCIceCandidate | null;
}
