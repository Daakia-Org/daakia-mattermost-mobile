// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {generateMattermostToken, listOrganizations, sendOTP, verifyOTP} from '@daakia_backend_apis/services';
import React, {useCallback, useState} from 'react';
import {useIntl} from 'react-intl';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import Button from '@components/button';
import FloatingTextInput from '@components/floating_input/floating_text_input_label';
import Loading from '@components/loading';
import {changeOpacity, makeStyleSheetFromTheme} from '@utils/theme';
import {typography} from '@utils/typography';

import AuthError from './components/auth_error';
import AuthSuccess from './components/auth_success';

interface SSONativeLoginProps {
    doSSOLogin: (bearerToken: string, csrfToken: string) => void;
    loginError: string;
    loginUrl: string;
    setLoginError: (value: string) => void;
    theme: Theme;
}

const getStyleSheet = makeStyleSheetFromTheme((theme: Theme) => ({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        backgroundColor: theme.centerChannelBg,
    },
    inner: {
        width: '100%',
        maxWidth: 520,
        alignSelf: 'center',
    },
    title: {
        textAlign: 'left',
        marginBottom: 8,
        color: theme.centerChannelColor,
        ...typography('Heading', 900, 'SemiBold'),
    },
    subtitle: {
        textAlign: 'left',
        marginBottom: 24,
        color: changeOpacity(theme.centerChannelColor, 0.64),
        ...typography('Body', 200, 'Regular'),
    },
    inputLabel: {
        marginBottom: 4,
        color: changeOpacity(theme.centerChannelColor, 0.72),
        ...typography('Body', 200, 'SemiBold'),
    },
    input: {
        height: 48,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: changeOpacity(theme.centerChannelColor, 0.24),
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
        backgroundColor: theme.centerChannelBg,
        color: theme.centerChannelColor,
        ...typography('Body', 200, 'Regular'),
    },
    phoneRow: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 8,
    },
    countryCodeInput: {
        width: 80,
        height: 48,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: changeOpacity(theme.centerChannelColor, 0.24),
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: theme.centerChannelBg,
        color: theme.centerChannelColor,
        ...typography('Body', 200, 'Regular'),
    },
    phoneInput: {
        flex: 1,
        height: 48,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: changeOpacity(theme.centerChannelColor, 0.24),
        borderRadius: 8,
        paddingHorizontal: 16,
        backgroundColor: theme.centerChannelBg,
        color: theme.centerChannelColor,
        ...typography('Body', 200, 'Regular'),
    },
    buttonSpacing: {
        marginTop: 24,
    },
    workspaceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: changeOpacity(theme.buttonBg, 0.04),
    },
    workspaceAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: changeOpacity(theme.buttonBg, 0.12),
    },
    workspaceAvatarText: {
        color: theme.buttonColor,
        ...typography('Body', 100, 'SemiBold'),
    },
    workspaceInfo: {
        marginLeft: 12,
        flex: 1,
    },
    workspaceName: {
        color: theme.centerChannelColor,
        ...typography('Body', 200, 'SemiBold'),
    },
    workspaceRole: {
        marginTop: 2,
        color: changeOpacity(theme.centerChannelColor, 0.64),
        ...typography('Body', 75, 'Regular'),
    },
    loadingOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        backgroundColor: changeOpacity(theme.centerChannelBg, 0.56),
    },
    loadingText: {
        marginTop: 8,
        color: changeOpacity(theme.centerChannelColor, 0.72),
        textAlign: 'center',
        ...typography('Body', 75, 'Regular'),
    },
}));

/**
 * SSONativeLogin - Mobile login without browser/WebView
 *
 * Flow:
 * 1. User enters email/phone
 * 2. Send OTP via Node.js API (/v2.0/auth/send/otp)
 * 3. User enters OTP
 * 4. Verify OTP and get Daakia token (/v2.0/auth/verify/otp)
 * 5. Get Mattermost auth token (/v2.0/mobile-auth/generate-mattermost-token)
 * 6. Exchange token with Mattermost (/api/v4/daakia/mobile-login)
 * 7. Call doSSOLogin() with MMAUTHTOKEN and MMCSRF - same as browser SSO!
 */
const SSONativeLogin = ({
    doSSOLogin,
    loginError,
    loginUrl,
    setLoginError,
    theme,
}: SSONativeLoginProps) => {
    const intl = useIntl();
    const styles = getStyleSheet(theme);

    // State
    const [step, setStep] = useState<'credentials' | 'otp' | 'selectOrg' | 'success'>('credentials');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState<string | undefined>();
    const [requestId, setRequestId] = useState(''); // For OTP verification
    const [daakiaToken, setDaakiaToken] = useState(''); // For reuse after org selection
    const [organizations, setOrganizations] = useState<Array<{id?: number; organization_name?: string; user_role?: string}>>([]);
    const [emailError, setEmailError] = useState<string | undefined>();
    const [otpError, setOtpError] = useState<string | undefined>();

    // Extract server URL from loginUrl
    const getServerUrl = useCallback(() => {
        try {
            const url = new URL(loginUrl);
            return url.origin;
        } catch {
            return '';
        }
    }, [loginUrl]);

    // Step 1: Send OTP
    const handleSendOTP = useCallback(async () => {
        if (!email) {
            setEmailError(
                intl.formatMessage({id: 'mobile.login.email_required', defaultMessage: 'Please enter your email'}),
            );
            return;
        }

        setLoading(true);
        setEmailError(undefined);
        const message = intl.formatMessage({
            id: 'mobile.login.loading_send_otp_email',
            defaultMessage: 'Sending code to your email…',
        });
        setLoadingMessage(message);
        setLoginError('');

        try {
            const data = await sendOTP({email});

            if (data.success === 1 && data.data?.request_id) {
                setRequestId(data.data.request_id);
                setStep('otp');
            } else {
                setLoginError(data.message || intl.formatMessage({
                    id: 'mobile.login.send_otp_failed',
                    defaultMessage: 'Failed to send OTP. Please try again.',
                }));
            }
        } catch (error) {
            setLoginError(
                intl.formatMessage({id: 'mobile.login.send_otp_failed', defaultMessage: 'Failed to send OTP. Please try again.'}),
            );
        } finally {
            setLoading(false);
            setLoadingMessage(undefined);
        }
    }, [email, intl, setLoginError]);

    // Restrict OTP input to digits only and max 6 chars
    const handleOtpChange = useCallback((value: string) => {
        const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
        setOtp(digitsOnly);

        if (otpError && digitsOnly.length === 6) {
            setOtpError(undefined);
        }
    }, [otpError]);

    // Step 2: Verify OTP and Login
    const handleVerifyAndLogin = useCallback(async () => {
        if (!otp || otp.length !== 6) {
            setOtpError(
                intl.formatMessage({id: 'mobile.login.otp_invalid', defaultMessage: 'Please enter a valid 6-digit code'}),
            );
            return;
        }

        if (!requestId) {
            setLoginError(
                intl.formatMessage({id: 'mobile.login.session_expired', defaultMessage: 'Session expired. Please request OTP again.'}),
            );
            setStep('credentials');
            return;
        }

        setLoading(true);
        setLoadingMessage(
            intl.formatMessage({id: 'mobile.login.loading_verify_otp', defaultMessage: 'Verifying your code…'}),
        );
        setLoginError('');

        try {
            const serverUrl = getServerUrl();
            if (!serverUrl) {
                setLoginError(
                    intl.formatMessage({id: 'mobile.login.invalid_server_url', defaultMessage: 'Invalid server URL'}),
                );
                setLoading(false);
                return;
            }

            // Step 2a: Verify OTP and get Daakia token
            const verifyData = await verifyOTP({
                request_id: requestId,
                otp,
                type: 'email',
            });

            if (verifyData.success !== 1 || !verifyData.data?.token) {
                setOtpError(verifyData.message || intl.formatMessage({
                    id: 'mobile.login.otp_invalid',
                    defaultMessage: 'Please enter a valid 6-digit code',
                }));
                setLoading(false);
                return;
            }

            const tokenFromOtp = verifyData.data.token;

            // Step 2b: Get Mattermost auth token from Node.js
            // Persist daakia token for potential org selection
            setDaakiaToken(tokenFromOtp);

            // NEW: Load organizations so user can switch like web
            const orgData = await listOrganizations({
                daakia_token: tokenFromOtp,
            });

            if (orgData.success !== 1 || !Array.isArray(orgData.organizations) || orgData.organizations.length === 0) {
                const errorMessage = orgData.message || 'No corporate accounts found. Konnect is only available for corporate Daakia accounts.';
                setLoginError(errorMessage);
                setLoading(false);
                setLoadingMessage(undefined);
                return;
            }

            // Always let user pick org (even if only one) – switch UI like web
            setOrganizations(orgData.organizations);
            setStep('selectOrg');
            setLoading(false);
            setLoadingMessage(undefined);
        } catch (error) {
            setLoginError(
                intl.formatMessage({id: 'mobile.login.generic_error', defaultMessage: 'Login failed. Please try again.'}),
            );
            setLoading(false);
            setLoadingMessage(undefined);
        }
    }, [otp, requestId, getServerUrl, intl, setLoginError]);

    // Render error state
    if (loginError) {
        return (
            <View style={styles.container}>
                <AuthError
                    error={loginError}
                    retry={() => {
                        setLoginError('');
                        setStep('credentials');
                        setOtp('');
                    }}
                    theme={theme}
                />
            </View>
        );
    }

    // Render success state
    if (step === 'success') {
        return (
            <View style={styles.container}>
                <AuthSuccess theme={theme}/>
            </View>
        );
    }

    // Render organization selection (switch functionality like web)
    if (step === 'selectOrg') {
        const sortedOrgs = [...organizations].sort((a, b) => {
            const roleA = (a.user_role || '').toLowerCase();
            const roleB = (b.user_role || '').toLowerCase();
            if (roleA === roleB) {
                return 0;
            }
            if (roleA === 'admin') {
                return -1;
            }
            if (roleB === 'admin') {
                return 1;
            }
            return 0;
        });

        const handleWorkspacePress = async (orgId?: number) => {
            const org = sortedOrgs.find((o) => o.id === orgId);
            if (!org) {
                return;
            }
            if (!daakiaToken) {
                setLoginError(
                    intl.formatMessage({id: 'mobile.login.session_expired', defaultMessage: 'Session expired. Please request OTP again.'}),
                );
                setStep('credentials');
                return;
            }

            setLoading(true);
            setLoginError('');

            try {
                const serverUrl = getServerUrl();
                if (!serverUrl) {
                    setLoginError(
                        intl.formatMessage({id: 'mobile.login.invalid_server_url', defaultMessage: 'Invalid server URL'}),
                    );
                    setLoading(false);
                    return;
                }

                const tokenData = await generateMattermostToken({
                    daakia_token: daakiaToken,
                    active_org_id: org.id,
                });

                if (tokenData.success !== 1 || !tokenData.mattermost_auth_token) {
                    const errorMessage = tokenData.message || 'Failed to generate token';
                    setLoginError(errorMessage);
                    setLoading(false);
                    return;
                }

                const mmLoginUrl = `${serverUrl}/api/v4/daakia/mobile-login`;
                const mmResponse = await fetch(mmLoginUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        mattermost_auth_token: tokenData.mattermost_auth_token,
                    }),
                });

                const rawText = await mmResponse.text();

                if (!mmResponse.ok) {
                    let friendlyMessage = 'Failed to login to Mattermost. Please try again.';
                    try {
                        const mmError = JSON.parse(rawText);
                        if (mmError?.message) {
                            friendlyMessage = mmError.message;
                        }
                    } catch {
                        // ignore JSON parse errors, fall back to generic message
                    }

                    setLoginError(friendlyMessage);
                    setLoading(false);
                    return;
                }

                let mmData;
                try {
                    mmData = JSON.parse(rawText);
                } catch (e) {
                    setLoginError('Invalid response from Mattermost');
                    setLoading(false);
                    return;
                }

                if (!mmData.MMAUTHTOKEN || !mmData.MMCSRF) {
                    setLoginError('Invalid response from Mattermost');
                    setLoading(false);
                    return;
                }

                setStep('success');
                doSSOLogin(mmData.MMAUTHTOKEN, mmData.MMCSRF);
            } catch (error) {
                setLoginError(
                    intl.formatMessage({id: 'mobile.login.generic_error', defaultMessage: 'Login failed. Please try again.'}),
                );
            } finally {
                setLoading(false);
            }
        };

        return (
            <View style={[styles.container, {justifyContent: 'flex-start', paddingTop: 64}]}>
                <View style={styles.inner}>
                    <Text style={styles.title}>
                        {intl.formatMessage({id: 'mobile.login.select_org_title', defaultMessage: 'Choose a workspace'})}
                    </Text>
                    <Text style={styles.subtitle}>
                        {intl.formatMessage({
                            id: 'mobile.login.select_org_subtitle',
                            defaultMessage: 'Select which corporate Daakia account you want to use with Konnect.',
                        })}
                    </Text>
                    {sortedOrgs.map((org) => {
                        const initials = (org.organization_name || 'W').trim().charAt(0).toUpperCase();
                        const roleLabel = (org.user_role || 'member').toLowerCase();

                        return (
                            <View
                                key={String(org.id || org.organization_name)}
                                style={styles.buttonSpacing}
                            >
                                <TouchableOpacity
                                    style={styles.workspaceItem}
                                    onPress={() => handleWorkspacePress(org.id)}
                                    disabled={loading}
                                >
                                    <View style={styles.workspaceAvatar}>
                                        <Text style={styles.workspaceAvatarText}>
                                            {initials}
                                        </Text>
                                    </View>
                                    <View style={styles.workspaceInfo}>
                                        <Text
                                            style={styles.workspaceName}
                                            numberOfLines={1}
                                        >
                                            {org.organization_name || 'Workspace'}
                                        </Text>
                                        <Text style={styles.workspaceRole}>
                                            {roleLabel}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    }

    // Render OTP input
    if (step === 'otp') {
        return (
            <View style={styles.container}>
                <View style={styles.inner}>
                    <Text style={styles.title}>
                        {intl.formatMessage({id: 'mobile.login.otp_title', defaultMessage: 'Enter verification code'})}
                    </Text>
                    <Text style={styles.subtitle}>
                        {intl.formatMessage({
                            id: 'mobile.login.otp_subtitle',
                            defaultMessage: 'We sent a 6-digit code to your email. Enter it below to continue.',
                        })}
                    </Text>
                    <FloatingTextInput
                        rawInput={true}
                        blurOnSubmit={false}
                        disableFullscreenUI={true}
                        enablesReturnKeyAutomatically={true}
                        keyboardType='number-pad'
                        label={intl.formatMessage({id: 'mobile.login.otp_placeholder', defaultMessage: 'Enter 6-digit OTP'})}
                        onChangeText={handleOtpChange}
                        value={otp}
                        theme={theme}
                        maxLength={6}
                        autoFocus={true}
                        error={otpError}
                    />
                    <View style={styles.buttonSpacing}>
                        <Button
                            text={intl.formatMessage({id: 'mobile.login.verify_login', defaultMessage: 'Verify & Login'})}
                            onPress={handleVerifyAndLogin}
                            disabled={loading}
                            size='lg'
                            theme={theme}
                        />
                    </View>
                    <View style={styles.buttonSpacing}>
                        <Button
                            text={intl.formatMessage({id: 'mobile.login.resend_otp', defaultMessage: 'Resend OTP'})}
                            onPress={handleSendOTP}
                            disabled={loading}
                            size='lg'
                            emphasis='secondary'
                            theme={theme}
                        />
                    </View>
                </View>
                {loading && (
                    <Loading
                        containerStyle={styles.loadingOverlay}
                        size='large'
                        themeColor='buttonBg'
                        footerText={loadingMessage}
                        footerTextStyles={styles.loadingText}
                        testID='sso_native_loading'
                    />
                )}
            </View>
        );
    }

    // Render credentials input (email only for now)
    return (
        <View style={styles.container}>
            <View style={styles.inner}>
                <Text style={styles.title}>
                    {intl.formatMessage({id: 'mobile.login.native_title', defaultMessage: 'Sign in with Daakia'})}
                </Text>
                <Text style={styles.subtitle}>
                    {intl.formatMessage({
                        id: 'mobile.login.native_subtitle',
                        defaultMessage: 'Enter your email to receive a one-time verification code.',
                    })}
                </Text>
                <FloatingTextInput
                    rawInput={true}
                    blurOnSubmit={false}
                    autoComplete='email'
                    disableFullscreenUI={true}
                    enablesReturnKeyAutomatically={true}
                    keyboardType='email-address'
                    label={intl.formatMessage({id: 'mobile.login.email_label', defaultMessage: 'Email'})}
                    onChangeText={setEmail}
                    value={email}
                    theme={theme}
                    autoFocus={true}
                    error={emailError}
                />
                <View style={styles.buttonSpacing}>
                    <Button
                        text={intl.formatMessage({id: 'mobile.login.send_otp', defaultMessage: 'Send OTP'})}
                        onPress={handleSendOTP}
                        disabled={loading}
                        size='lg'
                        theme={theme}
                    />
                </View>
            </View>
            {loading && (
                <Loading
                    containerStyle={styles.loadingOverlay}
                    size='large'
                    themeColor='buttonBg'
                    testID='sso_native_loading'
                />
            )}
        </View>
    );
};

export default SSONativeLogin;
