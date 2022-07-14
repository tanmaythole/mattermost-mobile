// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useState} from 'react';
import {BehaviorSubject} from 'rxjs';

import {CallsState, DefaultCallsState} from '@app/products/calls/types/calls';

const callsStateSubjects = {} as Dictionary<BehaviorSubject<CallsState>>;

const getCallsStateSubject = (serverUrl: string) => {
    if (!callsStateSubjects[serverUrl]) {
        callsStateSubjects[serverUrl] = new BehaviorSubject(DefaultCallsState);
    }

    return callsStateSubjects[serverUrl];
};

export const getCallsState = (serverUrl: string) => {
    return getCallsStateSubject(serverUrl).value;
};

// Used internally, only exported for tests (not exported from the module index).
export const setCallsState = (serverUrl: string, state: CallsState) => {
    getCallsStateSubject(serverUrl).next(state);
};

export const observeCallsState = (serverUrl: string) => {
    return getCallsStateSubject(serverUrl).asObservable();
};

// Used internally (for now). Only exported for tests (not exported from the module index).
export const useCallsState = (serverUrl: string) => {
    const [state, setState] = useState(DefaultCallsState);

    const callsStateSubject = getCallsStateSubject(serverUrl);

    useEffect(() => {
        const subscription = callsStateSubject.subscribe((callsState) => {
            setState(callsState);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    return state;
};
