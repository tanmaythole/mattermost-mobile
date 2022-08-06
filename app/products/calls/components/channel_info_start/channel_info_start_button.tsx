// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useIntl} from 'react-intl';

import {leaveCall} from '@calls/actions';
import leaveAndJoinWithAlert from '@calls/components/leave_and_join_alert';
import {useTryCallsFunction} from '@calls/hooks';
import OptionBox from '@components/option_box';
import {preventDoubleTap} from '@utils/tap';

export interface Props {
    serverUrl: string;
    displayName: string;
    channelId: string;
    isACallInCurrentChannel: boolean;
    confirmToJoin: boolean;
    alreadyInCall: boolean;
    currentCallChannelName: string;
    dismissChannelInfo: () => void;
}

const ChannelInfoStartButton = ({
    serverUrl,
    displayName,
    channelId,
    isACallInCurrentChannel,
    confirmToJoin,
    alreadyInCall,
    currentCallChannelName,
    dismissChannelInfo,
}: Props) => {
    const intl = useIntl();

    const toggleJoinLeave = useCallback(() => {
        if (alreadyInCall) {
            leaveCall();
        } else {
            leaveAndJoinWithAlert(intl, serverUrl, channelId, currentCallChannelName, displayName, confirmToJoin, !isACallInCurrentChannel);
        }

        dismissChannelInfo();
    }, [alreadyInCall, dismissChannelInfo, intl, serverUrl, channelId, currentCallChannelName, displayName, confirmToJoin, isACallInCurrentChannel]);
    const [tryJoin, msgPostfix] = useTryCallsFunction(toggleJoinLeave);

    const joinText = intl.formatMessage({id: 'mobile.calls_join_call', defaultMessage: 'Join Call'});
    const startText = intl.formatMessage({id: 'mobile.calls_start_call', defaultMessage: 'Start Call'});
    const leaveText = intl.formatMessage({id: 'mobile.calls_leave_call', defaultMessage: 'Leave Call'});

    return (
        <OptionBox
            onPress={preventDoubleTap(tryJoin)}
            text={startText + msgPostfix}
            iconName='phone-outline'
            activeText={joinText + msgPostfix}
            activeIconName='phone-in-talk'
            isActive={isACallInCurrentChannel}
            destructiveText={leaveText}
            destructiveIconName={'phone-hangup'}
            isDestructive={alreadyInCall}
            testID='channel_info.options.join_start_call.option'
        />
    );
};

export default ChannelInfoStartButton;
