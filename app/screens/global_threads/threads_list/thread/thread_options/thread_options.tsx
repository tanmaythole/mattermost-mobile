// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Animated, StyleSheet, View} from 'react-native';

import {useTheme} from '@app/context/theme';
import {changeOpacity} from '@app/utils/theme';

import MarkAsReadOption from './mark_as_read_option';
import Option from './option';
import UnfollowOption from './unfollow_option';

import type {ThreadModel} from '@app/database/models/server';

type Props = {
    progress: Animated.AnimatedInterpolation<number>;
    dragX: Animated.AnimatedInterpolation<number>;
    onMore: () => void;
    teamId: string;
    thread: ThreadModel;
    threadItemTestId: string;
}

const OPTION_SIZE = 86;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
    },
});

const ThreadOptions = ({progress, dragX, onMore, teamId, thread, threadItemTestId}: Props) => {
    const theme = useTheme();

    const width = dragX.addListener(({value}) => {console.log(value)});
    console.log("width ==> ", width)

    return (
        <View style={styles.container}>
            <Option
                color={changeOpacity(theme.centerChannelColor, 0.48)}
                icon={'dots-horizontal'}
                onPress={onMore}
                positionX={OPTION_SIZE * 3}
                progress={progress}
                testID={`${threadItemTestId}.more`}
                text='More'
            />
            <MarkAsReadOption
                positionX={OPTION_SIZE * 2}
                progress={progress}
                thread={thread}
                teamId={teamId}
                testId={`${threadItemTestId}.read`}
            />
            <UnfollowOption
                positionX={OPTION_SIZE}
                progress={progress}
                thread={thread}
                teamId={teamId}
                testId={`${threadItemTestId}.unfollow`}
            />
        </View>
    );
};

export default ThreadOptions;
