// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';

import {observeTeamIdByThread} from '@queries/servers/thread';

import ThreadOptions from './thread_options';

import type {WithDatabaseArgs} from '@typings/database/database';
import type ThreadModel from '@typings/database/models/servers/thread';

type Props = WithDatabaseArgs & {thread: ThreadModel};

const enhanced = withObservables(['thread'], ({thread, database}: Props) => {
    return {
        teamId: observeTeamIdByThread(database, thread),
    };
});

export default withDatabase(enhanced(ThreadOptions));
