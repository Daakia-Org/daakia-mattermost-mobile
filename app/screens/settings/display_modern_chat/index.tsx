// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {withDatabase, withObservables} from '@nozbe/watermelondb/react';
import {of as of$} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {Preferences} from '@constants';
import {getDisplayNamePreferenceAsBool} from '@helpers/api/preference';
import {queryDisplayNamePreferences} from '@queries/servers/preference';
import {observeCurrentUser} from '@queries/servers/user';

import DisplayModernChat from './display_modern_chat';

import type {WithDatabaseArgs} from '@typings/database/database';

const enhanced = withObservables([], ({database}: WithDatabaseArgs) => {
    const currentUser = observeCurrentUser(database);

    return {
        currentUserId: currentUser.pipe(switchMap((user) => of$(user?.id || ''))),
        isModernChatEnabled: queryDisplayNamePreferences(database).
            observeWithColumns(['value']).pipe(
                switchMap(
                    (preferences) => of$(getDisplayNamePreferenceAsBool(preferences, Preferences.MODERN_CHAT_LAYOUT)),
                ),
            ),
    };
});

export default withDatabase(enhanced(DisplayModernChat));
