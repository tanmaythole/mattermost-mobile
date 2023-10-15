// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {Children, type ReactElement, useCallback} from 'react';
import {useIntl} from 'react-intl';
import {Alert, Text} from 'react-native';
import urlParse from 'url-parse';

import {useServerUrl} from '@context/server';
import {handleDeepLink, matchDeepLink} from '@utils/deep_link';
import {preventDoubleTap} from '@utils/tap';
import {normalizeProtocol, tryOpenURL} from '@utils/url';

type MarkdownLinkProps = {
    children: ReactElement;
    experimentalNormalizeMarkdownLinks: string;
    href: string;
    siteURL: string;
    onLinkLongPress?: (url?: string) => void;
}

const parseLinkLiteral = (literal: string) => {
    let nextLiteral = literal;

    const WWW_REGEX = /\b^(?:www.)/i;
    if (nextLiteral.match(WWW_REGEX)) {
        nextLiteral = literal.replace(WWW_REGEX, 'www.');
    }

    const parsed = urlParse(nextLiteral, {});

    return parsed.href;
};

const MarkdownLink = ({children, experimentalNormalizeMarkdownLinks, href, siteURL, onLinkLongPress}: MarkdownLinkProps) => {
    const intl = useIntl();
    const serverUrl = useServerUrl();

    const {formatMessage} = intl;

    const handlePress = useCallback(preventDoubleTap(async () => {
        const url = normalizeProtocol(href);

        if (!url) {
            return;
        }

        const onError = () => {
            Alert.alert(
                formatMessage({
                    id: 'mobile.link.error.title',
                    defaultMessage: 'Error',
                }),
                formatMessage({
                    id: 'mobile.link.error.text',
                    defaultMessage: 'Unable to open the link.',
                }),
            );
        };

        const match = matchDeepLink(url, serverUrl, siteURL);

        if (match) {
            const {error} = await handleDeepLink(match, intl);
            if (error) {
                tryOpenURL(match, onError);
            }
        } else {
            tryOpenURL(url, onError);
        }
    }), [href, intl.locale, serverUrl, siteURL]);

    const parseChildren = useCallback(() => {
        return Children.map(children, (child: ReactElement) => {
            if (!child.props.literal || typeof child.props.literal !== 'string' || (child.props.context && child.props.context.length && !child.props.context.includes('link'))) {
                return child;
            }

            const {props, ...otherChildProps} = child;
            // eslint-disable-next-line react/prop-types
            const {literal, ...otherProps} = props;

            const nextProps = {
                literal: parseLinkLiteral(literal),
                ...otherProps,
            };

            return {
                props: nextProps,
                ...otherChildProps,
            };
        });
    }, [children]);

    const renderChildren = experimentalNormalizeMarkdownLinks ? parseChildren() : children;

    return (
        <Text
            onPress={handlePress}
            onLongPress={() => onLinkLongPress?.(href)}
            testID='markdown_link'
        >
            {renderChildren}
        </Text>
    );
};

export default MarkdownLink;
