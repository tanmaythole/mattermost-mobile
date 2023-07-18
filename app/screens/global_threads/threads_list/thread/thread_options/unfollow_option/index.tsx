// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useIntl} from 'react-intl';

import {updateThreadFollowing} from '@actions/remote/thread';
import {useServerUrl} from '@app/context/server';
import {useTheme} from '@app/context/theme';

import Option from '../option';

import type {ThreadModel} from '@app/database/models/server';
import type {Animated} from 'react-native';

type Props = {
    positionX: number;
    progress: Animated.AnimatedInterpolation<number>;
    teamId: string;
    thread: ThreadModel;
    testId: string;
};

const UnfollowOption = ({positionX, progress, thread, teamId, testId}: Props) => {
    const intl = useIntl();
    const theme = useTheme();
    const serverUrl = useServerUrl();

    const handleToggleFollow = useCallback(async () => {
        if (teamId == null) {
            return;
        }
        updateThreadFollowing(serverUrl, teamId, thread.id, !thread.isFollowing);
    }, [teamId, thread]);

    const icon = thread.isFollowing ? 'message-minus-outline' : 'mark-as-unread';
    const text = thread.isFollowing ? intl.formatMessage({id: 'thread_options.unfollow', defaultMessage: 'Unfollow'}) : intl.formatMessage({id: 'thread_options.follow', defaultMessage: 'Follow'});

    return (
        <Option
            color={theme.linkColor}
            icon={icon}
            onPress={handleToggleFollow}
            positionX={positionX}
            progress={progress}
            testID={testId}
            text={text}
        />
    );
};

export default UnfollowOption;
