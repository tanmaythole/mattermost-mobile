// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo} from 'react';
import {Animated, StyleProp, Text, View, ViewStyle} from 'react-native';
import {RectButton} from 'react-native-gesture-handler';

import CompassIcon from '@app/components/compass_icon';
import {useTheme} from '@app/context/theme';
import {makeStyleSheetFromTheme} from '@app/utils/theme';
import {typography} from '@app/utils/typography';

type Props = {
    color: string;
    icon: string;
    onPress: () => void;
    positionX: number;
    progress: Animated.AnimatedInterpolation<number>;
    style?: StyleProp<ViewStyle>;
    testID?: string;
    text: string;
}

export const OPTION_SIZE = 86;

const getStyleSheet = makeStyleSheetFromTheme((theme: Theme) => ({
    centered: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        height: '100%',
        width: OPTION_SIZE,
    },
    text: {
        color: theme.sidebarText,
        ...typography('Body', 75, 'SemiBold'),
    },
}));

const ThreadOption = ({color, icon, onPress, positionX, progress, style, testID, text}: Props) => {
    const theme = useTheme();
    const styles = getStyleSheet(theme);

    const containerStyle = useMemo(() => {
        return [styles.container, {backgroundColor: color}, style];
    }, [color, style]);
    const centeredStyle = useMemo(() => [styles.container, styles.centered], []);

    const trans = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [positionX, 0],
        extrapolate: 'clamp',
    });

    return (
        <Animated.View style={{transform: [{translateX: trans}]}}>
            <View
                style={containerStyle}
                testID={testID}
            >
                <RectButton
                    style={centeredStyle}
                    onPress={onPress}
                >
                    <CompassIcon
                        color={theme.buttonColor}
                        name={icon}
                        size={24}
                    />
                    <Text style={styles.text}>{text}</Text>
                </RectButton>
            </View>
        </Animated.View>
    );
};

export default ThreadOption;
