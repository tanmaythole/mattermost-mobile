// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useIntl} from 'react-intl';

import {markThreadAsRead, markThreadAsUnread} from '@actions/remote/thread';
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

const MarkAsReadOption = ({positionX, progress, thread, teamId, testId}: Props) => {
    const intl = useIntl();
    const theme = useTheme();
    const serverUrl = useServerUrl();

    const onHandlePress = useCallback(async () => {
        if (thread.unreadReplies) {
            markThreadAsRead(serverUrl, teamId, thread.id);
        } else {
            markThreadAsUnread(serverUrl, teamId, thread.id, thread.id);
        }
    }, [serverUrl, teamId, thread]);

    const icon = thread.unreadReplies ? 'check' : 'mark-as-unread';
    const text = thread.unreadReplies ? intl.formatMessage({id: 'thread_options.read', defaultMessage: 'Read'}) : intl.formatMessage({id: 'thread_options.unread', defaultMessage: 'Unread'});

    return (
        <Option
            color={theme.sidebarTextActiveBorder}
            icon={icon}
            onPress={onHandlePress}
            positionX={positionX}
            progress={progress}
            testID={testId}
            text={text}
        />
    );
};

export default MarkAsReadOption;
