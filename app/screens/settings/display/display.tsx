// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useMemo} from 'react';
import {defineMessage, useIntl} from 'react-intl';

import {savePreference} from '@actions/remote/preference';
import SettingContainer from '@components/settings/container';
import SettingItem from '@components/settings/item';
import {Preferences, Screens} from '@constants';
import {useServerUrl} from '@context/server';
import {useTheme} from '@context/theme';
import useAndroidHardwareBackHandler from '@hooks/android_back_handler';
import {usePreventDoubleTap} from '@hooks/utils';
import {goToScreen, popTopScreen} from '@screens/navigation';
import {gotoSettingsScreen} from '@screens/settings/config';
import {getUserTimezoneProps} from '@utils/user';

import type UserModel from '@typings/database/models/servers/user';
import type {AvailableScreens} from '@typings/screens/navigation';

const CRT_FORMAT = [
    defineMessage({
        id: 'display_settings.crt.on',
        defaultMessage: 'On',
    }),
    defineMessage({
        id: 'display_settings.crt.off',
        defaultMessage: 'Off',
    }),
];

const MODERN_CHAT_FORMAT = [
    defineMessage({
        id: 'display_settings.modern_chat.on',
        defaultMessage: 'On',
    }),
    defineMessage({
        id: 'display_settings.modern_chat.off',
        defaultMessage: 'Off',
    }),
];

const TIME_FORMAT = [
    defineMessage({
        id: 'display_settings.clock.standard',
        defaultMessage: '12-hour',
    }),
    defineMessage({
        id: 'display_settings.clock.military',
        defaultMessage: '24-hour',
    }),
];

const TIMEZONE_FORMAT = [
    defineMessage({
        id: 'display_settings.tz.auto',
        defaultMessage: 'Auto',
    }),
    defineMessage({
        id: 'display_settings.tz.manual',
        defaultMessage: 'Manual',
    }),
];

type DisplayProps = {
    componentId: AvailableScreens;
    currentUser?: UserModel;
    hasMilitaryTimeFormat: boolean;
    isCRTEnabled: boolean;
    isCRTSwitchEnabled: boolean;
    isThemeSwitchingEnabled: boolean;
    isModernChatEnabled: boolean;
}

const Display = ({componentId, currentUser, hasMilitaryTimeFormat, isCRTEnabled, isCRTSwitchEnabled, isThemeSwitchingEnabled, isModernChatEnabled}: DisplayProps) => {
    const intl = useIntl();
    const serverUrl = useServerUrl();
    const theme = useTheme();
    const timezone = useMemo(() => getUserTimezoneProps(currentUser), [currentUser]);

    const goToThemeSettings = usePreventDoubleTap(useCallback(() => {
        const screen = Screens.SETTINGS_DISPLAY_THEME;
        const title = intl.formatMessage({id: 'display_settings.theme', defaultMessage: 'Theme'});
        goToScreen(screen, title);
    }, [intl]));

    const goToClockDisplaySettings = usePreventDoubleTap(useCallback(() => {
        const screen = Screens.SETTINGS_DISPLAY_CLOCK;
        const title = intl.formatMessage({id: 'display_settings.clockDisplay', defaultMessage: 'Clock Display'});
        gotoSettingsScreen(screen, title);
    }, [intl]));

    const goToTimezoneSettings = usePreventDoubleTap(useCallback(() => {
        const screen = Screens.SETTINGS_DISPLAY_TIMEZONE;
        const title = intl.formatMessage({id: 'display_settings.timezone', defaultMessage: 'Timezone'});
        gotoSettingsScreen(screen, title);
    }, [intl]));

    const goToCRTSettings = usePreventDoubleTap(useCallback(() => {
        const screen = Screens.SETTINGS_DISPLAY_CRT;
        const title = intl.formatMessage({id: 'display_settings.crt', defaultMessage: 'Collapsed Reply Threads'});
        gotoSettingsScreen(screen, title);
    }, [intl]));

    const goToModernChatSettings = usePreventDoubleTap(useCallback(async () => {
        const newValue = !isModernChatEnabled;

        if (currentUser?.id) {
            await savePreference(serverUrl, [{
                user_id: currentUser.id,
                category: Preferences.CATEGORIES.DISPLAY_SETTINGS,
                name: Preferences.MODERN_CHAT_LAYOUT,
                value: newValue.toString(),
            }]);
        }
    }, [isModernChatEnabled, currentUser?.id, serverUrl]));

    const close = useCallback(() => {
        popTopScreen(componentId);
    }, [componentId]);

    useAndroidHardwareBackHandler(componentId, close);

    return (
        <SettingContainer testID='display_settings'>
            {isThemeSwitchingEnabled && (
                <SettingItem
                    optionName='theme'
                    onPress={goToThemeSettings}
                    info={theme.type!}
                    testID='display_settings.theme.option'
                />
            )}
            <SettingItem
                optionName='clock'
                onPress={goToClockDisplaySettings}
                info={intl.formatMessage(hasMilitaryTimeFormat ? TIME_FORMAT[1] : TIME_FORMAT[0])}
                testID='display_settings.clock_display.option'
            />
            <SettingItem
                optionName='timezone'
                onPress={goToTimezoneSettings}
                info={intl.formatMessage(timezone.useAutomaticTimezone ? TIMEZONE_FORMAT[0] : TIMEZONE_FORMAT[1])}
                testID='display_settings.timezone.option'
            />
            {isCRTSwitchEnabled && (
                <SettingItem
                    optionName='crt'
                    onPress={goToCRTSettings}
                    info={intl.formatMessage(isCRTEnabled ? CRT_FORMAT[0] : CRT_FORMAT[1])}
                    testID='display_settings.crt.option'
                />
            )}
            <SettingItem
                optionName='modern_chat'
                onPress={goToModernChatSettings}
                info={intl.formatMessage(isModernChatEnabled ? MODERN_CHAT_FORMAT[0] : MODERN_CHAT_FORMAT[1])}
                testID='display_settings.modern_chat.option'
            />
        </SettingContainer>
    );
};

export default Display;
