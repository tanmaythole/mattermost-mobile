// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {Overlay} from 'react-native-elements';

import CopyPublicLink from '@screens/gallery/footer/copy_public_link';
import DownloadWithAction from '@screens/gallery/footer/download_with_action';

import type {GalleryAction, GalleryItemType} from '@typings/screens/gallery';

const styles = StyleSheet.create({
    tablet: {

        // bottom: 100,
    },
    toast: {

        // flex: 1,
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'flex-end',

        // position: 'absolute',
        // zIndex: 100,
        // top: 400,
        alignItems: 'center',
    },
    backDrop: {opacity: 0},
});

type Props = {
    action: string;
    fileInfo: FileInfo;
    setAction: (action: GalleryAction) => void;
    setSelectedItemNumber?: (index: number | undefined) => void;
}
const Toasts = ({
    action,
    fileInfo,
    setAction,
    setSelectedItemNumber,
}: Props) => {
    const [showToast, setShowToast] = useState(true);
    const galleryItem = {...fileInfo, type: 'image'} as GalleryItemType;

    const toggleOverlay = useCallback(() => {
        setSelectedItemNumber?.(undefined);
        setShowToast(false);
    }, [setSelectedItemNumber]);

    useEffect(() => {
        if (action === 'none') {
            setShowToast(false);
            return;
        }
        setShowToast(true);
    }, [action]);

    return (
        <Overlay
            backdropStyle={styles.backDrop}
            fullScreen={false}
            isVisible={showToast}
            onBackdropPress={toggleOverlay}
            overlayStyle={[
                styles.tablet,
                styles.toast,

                //overlayStyle,
            ]}
        >
            {action === 'downloading' &&
                <DownloadWithAction
                    action={action}
                    item={galleryItem}
                    setAction={setAction}
                />
            }
            {action === 'copying' &&
                <CopyPublicLink
                    item={galleryItem}
                    setAction={setAction}
                />
            }
        </Overlay>
    );
};

export default Toasts;
