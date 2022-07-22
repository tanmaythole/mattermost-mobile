// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {CallParticipant} from '@calls/types/calls';
import {Post} from '@constants';
import Calls from '@constants/calls';
import PostModel from '@typings/database/models/servers/post';
import {isMinimumServerVersion} from '@utils/helpers';
import {displayUsername} from '@utils/user';

export function sortParticipants(teammateNameDisplay: string, participants?: Dictionary<CallParticipant>, presenterID?: string): CallParticipant[] {
    if (!participants) {
        return [];
    }

    const users = Object.values(participants);

    return users.sort(sortByName(teammateNameDisplay)).sort(sortByState(presenterID));
}

const sortByName = (teammateNameDisplay: string) => {
    return (a: CallParticipant, b: CallParticipant) => {
        const nameA = displayUsername(a.userModel, teammateNameDisplay);
        const nameB = displayUsername(b.userModel, teammateNameDisplay);
        return nameA.localeCompare(nameB);
    };
};

const sortByState = (presenterID?: string) => {
    return (a: CallParticipant, b: CallParticipant) => {
        if (a.id === presenterID) {
            return -1;
        } else if (b.id === presenterID) {
            return 1;
        }

        if (!a.muted && b.muted) {
            return -1;
        } else if (!b.muted && a.muted) {
            return 1;
        }

        if (a.raisedHand && !b.raisedHand) {
            return -1;
        } else if (b.raisedHand && !a.raisedHand) {
            return 1;
        } else if (a.raisedHand && b.raisedHand) {
            return a.raisedHand - b.raisedHand;
        }

        return 0;
    };
};

export function isSupportedServerCalls(serverVersion?: string) {
    if (serverVersion) {
        return isMinimumServerVersion(
            serverVersion,
            Calls.RequiredServer.MAJOR_VERSION,
            Calls.RequiredServer.MIN_VERSION,
            Calls.RequiredServer.PATCH_VERSION,
        );
    }

    return false;
}

export function isCallsCustomMessage(post: PostModel | Post): boolean {
    return Boolean(post.type && post.type?.startsWith(Post.POST_TYPES.CUSTOM_CALLS));
}
