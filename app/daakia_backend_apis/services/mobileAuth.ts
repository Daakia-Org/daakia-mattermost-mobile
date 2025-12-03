// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Platform} from 'react-native';

import {API_BASE_URL, MOBILE_AUTH_ENDPOINTS} from '../endpoints';

export interface Organization {
    id?: number;
    organization_name?: string;
    user_role?: string;
    is_active?: boolean;
}

export interface ListOrganizationsRequest {
    daakia_token: string;
}

export interface ListOrganizationsResponse {
    success: number;
    message?: string;
    organizations?: Organization[];
}

export interface GenerateMattermostTokenRequest {
    daakia_token: string;
    active_org_id?: number;
}

export interface GenerateMattermostTokenResponse {
    success: number;
    message?: string;
    mattermost_auth_token?: string;
}

/**
 * List organizations for the authenticated user
 */
export async function listOrganizations(request: ListOrganizationsRequest): Promise<ListOrganizationsResponse> {
    const response = await fetch(`${API_BASE_URL}${MOBILE_AUTH_ENDPOINTS.LIST_ORGANIZATIONS}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            platform: Platform.OS,
        },
        body: JSON.stringify(request),
    });

    return response.json();
}

/**
 * Generate Mattermost authentication token for selected organization
 */
export async function generateMattermostToken(request: GenerateMattermostTokenRequest): Promise<GenerateMattermostTokenResponse> {
    const response = await fetch(`${API_BASE_URL}${MOBILE_AUTH_ENDPOINTS.GENERATE_MATTERMOST_TOKEN}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            platform: Platform.OS,
        },
        body: JSON.stringify(request),
    });

    return response.json();
}

