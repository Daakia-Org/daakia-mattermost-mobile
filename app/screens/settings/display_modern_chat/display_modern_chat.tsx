// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useIntl} from 'react-intl';

import {savePreference} from '@actions/remote/preference';
import SettingContainer from '@components/settings/container';
import SettingOption from '@components/settings/option';
import {Preferences} from '@constants';
import {useServerUrl} from '@context/server';
import useAndroidHardwareBackHandler from '@hooks/android_back_handler';
import {popTopScreen} from '@screens/navigation';

import type {AvailableScreens} from '@typings/screens/navigation';

type Props = {
    componentId: AvailableScreens;
    currentUserId: string;
    isModernChatEnabled: boolean;
};

const DisplayModernChat = ({componentId, currentUserId, isModernChatEnabled}: Props) => {
    const intl = useIntl();
    const serverUrl = useServerUrl();

    const close = useCallback(() => {
        popTopScreen(componentId);
    }, [componentId]);

    const setModernChatLayout = useCallback(async (enabled: boolean) => {
        await savePreference(serverUrl, [{
            user_id: currentUserId,
            category: Preferences.CATEGORIES.DISPLAY_SETTINGS,
            name: Preferences.MODERN_CHAT_LAYOUT,
            value: enabled.toString(),
        }]);
    }, [serverUrl, currentUserId]);

    useAndroidHardwareBackHandler(componentId, close);

    return (
        <SettingContainer testID='display_modern_chat'>
            <SettingOption
                action={() => setModernChatLayout(false)}
                label={intl.formatMessage({
                    id: 'display_settings.modern_chat.traditional',
                    defaultMessage: 'Traditional (All messages on left)',
                })}
                selected={!isModernChatEnabled}
                testID='display_modern_chat.traditional.option'
                type='select'
            />
            <SettingOption
                action={() => setModernChatLayout(true)}
                label={intl.formatMessage({
                    id: 'display_settings.modern_chat.modern',
                    defaultMessage: 'Modern (Your messages on right)',
                })}
                selected={isModernChatEnabled}
                testID='display_modern_chat.modern.option'
                type='select'
            />
        </SettingContainer>
    );
};

export default DisplayModernChat;
