import React, { useState, useEffect } from 'react';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import {
    Window,
    WindowHeader,
    WindowContent,
    Button,
    styleReset,
    Panel,
    Hourglass,
    Table,
    TableHead,
    TableRow,
    TableHeadCell,
    TableBody,
    TableDataCell,
    Toolbar,
    TextField
} from 'react95';
import { Modal, Frame, Icon } from '@react95/core'

import original from 'react95/dist/themes/original';
import ms_sans_serif from 'react95/dist/fonts/ms_sans_serif.woff2';
import ms_sans_serif_bold from 'react95/dist/fonts/ms_sans_serif_bold.woff2';

const GlobalStyles = createGlobalStyle`
  ${styleReset}
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('${ms_sans_serif}') format('woff2');
    font-weight: 400;
    font-style: normal
  }
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('${ms_sans_serif_bold}') format('woff2');
    font-weight: bold;
    font-style: normal
  }
  body {
    font-family: 'ms_sans_serif';
    background: teal;
  }
`;

const URL = 'https://telegram-sentiment-messages-analysis-weathered-butterfly-9494.fly.dev'

function SentimentAnalysis({ closeSentimentAnalysis, isMobile }) {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showError, setShowError] = useState(false);
    const [monitoredChannel, setMonitoredChannel] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authStatus, setAuthStatus] = useState({
        is_authenticated: false,
        current_step: 'start',
        message: ''
    });
    const [monitoredChats, setMonitoredChats] = useState([]);
    const [isWindowOpen, setIsWindowOpen] = useState(true);

    const [apiId, setApiId] = useState('');
    const [apiHash, setApiHash] = useState('');
    const [channelNameFilter, setChannelNameFilter] = useState('');

    // Auth functions
    const checkAuthStatus = async () => {
        try {
            const response = await fetch(URL + '/auth/status');
            if (!response.ok) throw new Error('Failed to check auth status');
            const data = await response.json();
            setAuthStatus(data);
        } catch (err) {
            console.error('Auth check failed:', err);
        }
    };

    const startAuth = async () => {
        try {
            const response = await fetch(URL + '/auth/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: phoneNumber,
                    api_id: apiId,
                    api_hash: apiHash
                }),
            });
            if (!response.ok) throw new Error('Failed to start authentication');
            await checkAuthStatus();
        } catch (err) {
            setError(err.message);
            setShowError(true);
        }
    };

    const verifyCode = async () => {
        try {
            const response = await fetch(URL + '/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: verificationCode }),
            });
            if (!response.ok) throw new Error('Failed to verify code');
            await checkAuthStatus();
            setShowAuthModal(false);
        } catch (err) {
            setError(err.message);
            setShowError(true);
        }
    };

    const fetchChannels = async () => {
        setLoading(true);
        try {
            const response = await fetch(URL + '/list_channels');
            if (!response.ok) throw new Error('Failed to fetch channels');
            const data = await response.json();
            setChannels(data);
        } catch (err) {
            setError(err.message);
            setShowError(true);
        } finally {
            setLoading(false);
        }
    };

    const fetchMonitoredChats = async () => {
        try {
            const response = await fetch(URL + '/chats');
            if (!response.ok) throw new Error('Failed to fetch chats');
            const data = await response.json();
            setMonitoredChats(data);
        } catch (err) {
            setError(err.message);
            setShowError(true);
        }
    };

    const startMonitoring = async (index) => {
        try {
            const response = await fetch(URL + `/monitor_channel/${index}`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Failed to start monitoring');
            const data = await response.json();
            setMonitoredChannel(channels.find(c => c.index === index));
        } catch (err) {
            setError(err.message);
            setShowError(true);
        }
    };

    useEffect(() => {
        checkAuthStatus();
        const interval = setInterval(checkAuthStatus, 30000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetchChannels();
    }, []);

    useEffect(() => {
        fetchMonitoredChats();
        const interval = setInterval(fetchMonitoredChats, 10000);
        return () => clearInterval(interval);
    }, []);

    const logout = async () => {
        try {
            const response = await fetch('http://localhost:8000/auth/logout', {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Failed to logout');

            // Reset local state after successful logout
            setMonitoredChannel(null);
            setChannels([]);
            setMonitoredChats([]);

            // Update auth status
            await checkAuthStatus();
        } catch (err) {
            setError(err.message);
            setShowError(true);
        }
    };
    console.log('channelNameFilter', channelNameFilter)
    return (
        <Modal
            icon="notepad"
            title={`Sentiment Analysis`}
            closeModal={closeSentimentAnalysis}
            buttons={[{ value: "Close", onClick: closeSentimentAnalysis }]}
            menu={[
                { name: 'File', list: [] },
                { name: 'Edit', list: [] }
            ]}
            style={{ maxHeight: '50vw' }}
        >
            <Window className="window" style={{ width: '1120px', margin: '0 auto' }}>
                <WindowHeader className="window-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ flex: 1 }}>Crypto Sentiment Sniffer.exe</span>
                    <Button
                        onClick={() => setIsWindowOpen(false)}
                        size="sm"
                        style={{ paddingBottom: 4 }}
                    >
                        <span>×</span>
                    </Button>
                </WindowHeader>
                <WindowContent>
                    {/* Status Section */}
                    <Panel variant="well" style={{ padding: '1rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <Panel variant="well" style={{ padding: '0.5rem', flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        background: authStatus.is_authenticated ? '#2ecc71' : '#e74c3c',
                                        border: '2px solid #000'
                                    }} />
                                    <span>Telegram Status: {authStatus.is_authenticated ? 'Authenticated' : 'Not Authenticated'}</span>
                                </div>
                            </Panel>
                            <Panel variant="well" style={{ padding: '0.5rem', flex: 1 }}>
                                <span>Current Step: {authStatus.current_step}</span>
                            </Panel>
                            <Panel variant="well" style={{ padding: '0.5rem', flex: 2 }}>
                                <span>Message: {authStatus.message}</span>
                            </Panel>
                            <Button onClick={checkAuthStatus} size="sm">
                                Refresh Status
                            </Button>
                            {authStatus.is_authenticated ? (
                                <Button onClick={logout} size="sm">
                                    Logout
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => setShowAuthModal(true)}
                                    disabled={authStatus.is_authenticated}
                                >
                                    Connect to Telegram
                                </Button>
                            )}
                        </div>
                    </Panel>

                    {/* Content Area */}
                    <div style={{ display: 'flex', gap: '1rem', height: '50vh' }}>
                        {/* Channels Section */}
                        <Panel variant="well" style={{ padding: '1rem', flex: '3', maxHeight: '100%', overflowY: 'scroll' }}>
                            <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Available Channels</div>
                            <Panel variant="well" style={{ padding: '0.5rem', marginBottom: '1rem' }}>
                                {monitoredChannel ? (
                                    <p>📡 Monitoring: {monitoredChannel.title}</p>
                                ) : (
                                    <p>No channel being monitored</p>
                                )}
                            </Panel>
                            <Panel variant='well' style={{ padding: '0.8rem', margin: '1rem' }}>
                                <Toolbar>
                                    <TextField
                                        type="text"
                                        value={channelNameFilter}
                                        onChange={(e) => setChannelNameFilter(e.target.value)}
                                        placeholder="Search channels"

                                    />
                                </Toolbar>
                            </Panel>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <Hourglass size={32} />
                                    <p>Loading channels...</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableHeadCell style={{ width: 50 }}>Index</TableHeadCell>
                                            <TableHeadCell>Channel Name</TableHeadCell>
                                            <TableHeadCell style={{ width: 100 }}>Channel ID</TableHeadCell>
                                            <TableHeadCell style={{ width: 100 }}>Actions</TableHeadCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody style={{ maxHeight: '100px', overflowY: 'scroll' }}>
                                        {(!channelNameFilter ? channels : channels.filter((channel) =>
                                            channel.title.toLowerCase().includes(channelNameFilter.toLowerCase())
                                        )).map((channel) => (
                                            <TableRow key={channel.index}>
                                                <TableDataCell>{channel.index}</TableDataCell>
                                                <TableDataCell>📺 {channel.title}</TableDataCell>
                                                <TableDataCell>{channel.id}</TableDataCell>
                                                <TableDataCell>
                                                    <Button
                                                        onClick={() => startMonitoring(channel.index)}
                                                        disabled={monitoredChannel?.index === channel.index}
                                                        size="sm"
                                                        fullWidth
                                                    >
                                                        {monitoredChannel?.index === channel.index ? 'Monitoring' : 'Monitor'}
                                                    </Button>
                                                </TableDataCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}

                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                <Button onClick={fetchChannels} disabled={loading}>
                                    Refresh List
                                </Button>
                                {monitoredChannel && (
                                    <Button onClick={() => setMonitoredChannel(null)}>
                                        Stop Monitoring
                                    </Button>
                                )}
                            </div>
                        </Panel>

                        {/* Sentiment Section */}
                        <Panel variant="well" style={{ padding: '1rem', flex: '2' }}>
                            <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Sentiment Analysis</div>
                            <Panel variant="well" style={{ padding: '0.5rem', marginBottom: '1rem' }}>
                                <p>🔄 Auto-refreshing every 10 seconds</p>
                            </Panel>

                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeadCell>Channel</TableHeadCell>
                                        <TableHeadCell style={{ width: 100 }}>Direction</TableHeadCell>
                                        <TableHeadCell style={{ width: 100 }}>Confidence</TableHeadCell>
                                        <TableHeadCell style={{ width: 80 }}>Messages</TableHeadCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {monitoredChats.map((chat) => (
                                        <TableRow key={chat.chat_id}>
                                            <TableDataCell>{chat.chat_title}</TableDataCell>
                                            <TableDataCell>
                                                {chat.sentiment.direction === 'bullish' ? '📈' : chat.sentiment.direction === 'bearish' ? '📉' : '➖'}
                                                {chat.sentiment.direction}
                                            </TableDataCell>
                                            <TableDataCell>
                                                {chat.sentiment.confidence}%
                                            </TableDataCell>
                                            <TableDataCell>
                                                {chat.message_count}
                                            </TableDataCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div style={{ marginTop: '1rem' }}>
                                <Button onClick={fetchMonitoredChats}>
                                    Refresh Now
                                </Button>
                            </div>
                        </Panel>
                    </div>
                </WindowContent>
            </Window>

            {showAuthModal && (
                <Window
                    className="window"
                    style={{
                        width: '400px',
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 2,
                        backgroundColor: 'rgb(195, 199, 203)'
                    }}
                >
                    <WindowHeader>
                        <span>Telegram Authentication</span>
                    </WindowHeader>
                    <WindowContent>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {authStatus.current_step === 'start' || authStatus.current_step === 'awaiting_code' ? (
                                <>
                                    <Panel variant="well" style={{ padding: '1rem' }}>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone Number:</label>
                                            <input
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                placeholder="+1234567890"
                                                style={{ width: '100%', padding: '0.5rem' }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>API ID: <a href='https://my.telegram.org/' target='_blank'>https://my.telegram.org/</a></label>
                                            <input
                                                type="text"
                                                value={apiId}
                                                onChange={(e) => setApiId(e.target.value)}
                                                placeholder="Enter your Telegram API ID"
                                                style={{ width: '100%', padding: '0.5rem' }}
                                            />
                                        </div>

                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>API Hash:</label>
                                            <input
                                                type="text"
                                                value={apiHash}
                                                onChange={(e) => setApiHash(e.target.value)}
                                                placeholder="Enter your Telegram API Hash"
                                                style={{ width: '100%', padding: '0.5rem' }}
                                            />
                                        </div>
                                        <Button onClick={startAuth} disabled={!phoneNumber || authStatus.current_step === 'awaiting_code'}>
                                            Send Code
                                        </Button>
                                    </Panel>

                                    {authStatus.current_step === 'awaiting_code' && (
                                        <Panel variant="well" style={{ padding: '1rem' }}>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Verification Code:</label>
                                                <input
                                                    type="text"
                                                    value={verificationCode}
                                                    onChange={(e) => setVerificationCode(e.target.value)}
                                                    placeholder="12345"
                                                    style={{ width: '100%', padding: '0.5rem' }}
                                                />
                                            </div>
                                            <Button onClick={verifyCode} disabled={!verificationCode}>
                                                Verify Code
                                            </Button>
                                        </Panel>
                                    )}
                                </>
                            ) : (
                                <p>Authentication completed!</p>
                            )}
                            <Button onClick={() => setShowAuthModal(false)} style={{ marginTop: '1rem' }}>
                                Close
                            </Button>
                        </div>
                    </WindowContent>
                </Window>
            )}
        </Modal >
    )
}

export default SentimentAnalysis
