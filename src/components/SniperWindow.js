import React, { useState, useEffect, useCallback } from 'react';
import {
    Window,
    WindowHeader,
    WindowContent,
    Button,
    Panel,
    Table,
    TableHead,
    TableRow,
    TableHeadCell,
    TableBody,
    TableDataCell,
    Toolbar,
    NumberField as NumberFieldDefault,
    Checkbox,
    Fieldset as FieldsetDefault,
    Tabs,
    Tab,
    TabBody,
    TextInput,
    Select
} from 'react95';
import { Modal } from '@react95/core';
import styled from 'styled-components';

const Fieldset = styled(FieldsetDefault)`
  position: relative;
  padding: 20px 10px 10px 10px !important;
  margin-bottom: 15px !important;

  & > legend {
    position: absolute !important;
    top: -10px !important;
    left: 8px !important;
    padding: 0 4px !important;
    background: #c0c0c0 !important;
    margin: 0 !important;
    z-index: 1;
  }

  & > div > div {
    display: grid !important;
    grid-template-columns: 140px 1fr 40px !important;
    align-items: center !important;
    gap: 8px !important;
    margin-bottom: 8px !important;
  }

  & label {
    display: inline-block !important;
    min-width: 140px !important;
    margin-right: 10px !important;
  }
`;

const SpaceSpan = styled.span`
  margin-bottom: 8px !important;
  `;

const NumberField = styled(NumberFieldDefault)`
  width: 100% !important;
  min-width: 0 !important;

  & .react95-NumberField-buttons {
    display: flex !important;
    flex-direction: column !important;
    gap: 1px !important;
  }

  & .react95-NumberField-button {
    padding: 0 !important;
    min-height: 0 !important;
    height: 12px !important;
    width: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
`;

const useMessages = () => {
    const [messages, setMessages] = useState([]);
    const [ws, setWs] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [botStatus, setBotStatus] = useState({
        isRunning: false,
        positions: [],
        soldPositions: []
    });

    useEffect(() => {
        const websocket = new WebSocket('ws://localhost:3001');

        websocket.onopen = () => {
            console.log('Connected to server');
            setIsConnected(true);
            websocket.send('status');
        };

        websocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Received:', data);

                switch (data.type) {
                    case 'status_update':
                        setBotStatus(data.data);
                        break;
                    case 'buy_order':
                    case 'status':
                    case 'error':
                        setMessages(prev => [...prev, {
                            type: data.type,
                            timestamp: new Date().toISOString(),
                            content: data.data
                        }]);
                        break;
                    default:
                        setMessages(prev => [...prev, {
                            type: 'unknown',
                            timestamp: new Date().toISOString(),
                            content: event.data
                        }]);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
                setMessages(prev => [...prev, {
                    type: 'raw',
                    timestamp: new Date().toISOString(),
                    content: event.data
                }]);
            }
        };

        websocket.onclose = () => {
            console.log('Disconnected from server');
            setIsConnected(false);
        };

        setWs(websocket);

        return () => {
            websocket.close();
            setWs(null);
        };
    }, []);

    const sendMessage = useCallback((message) => {
        if (ws && isConnected) {
            ws.send(message);
        } else {
            console.warn('WebSocket is not connected');
        }
    }, [ws, isConnected]);

    return {
        messages,
        isConnected,
        sendMessage,
        setMessages,
        botStatus
    };
};

function SniperWindow({ closeSniper }) {
    const { messages, isConnected, sendMessage, setMessages, botStatus } = useMessages();
    const [isWindowOpen, setIsWindowOpen] = useState(true);

    return (
        <Modal
            icon="notepad"
            title="Sniper"
            closeModal={closeSniper}
            buttons={[{ value: "Close", onClick: closeSniper }]}
            menu={[
                { name: 'File', list: [] },
                { name: 'Edit', list: [] }
            ]}
            style={{ maxHeight: '50vw' }}
        >
            <Window className="window" style={{ width: '1120px', margin: '0 auto' }}>
                <WindowHeader className="window-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ flex: 1 }}>Sniper Bot.exe</span>
                    <Button
                        onClick={closeSniper}
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
                                        background: isConnected ? '#2ecc71' : '#e74c3c',
                                        border: '2px solid #000'
                                    }} />
                                    <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                                </div>
                            </Panel>
                            <Panel variant="well" style={{ padding: '0.5rem', flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        background: botStatus.isRunning ? '#2ecc71' : '#e74c3c',
                                        border: '2px solid #000'
                                    }} />
                                    <span>{botStatus.isRunning ? 'Bot running' : 'Bot stopped'}</span>
                                </div>
                            </Panel>
                            <Panel variant="well" style={{ padding: '0.5rem', flex: 2 }}>
                                <span>Active Positions: {botStatus.positions.length} | Sold Positions: {botStatus.soldPositions.length}</span>

                            </Panel>
                            <Panel>
                                <FilterConfigButton />
                            </Panel>
                        </div>
                    </Panel>

                    {/* Content Area */}
                    <div style={{ display: 'flex', gap: '1rem', height: '50vh' }}>
                        {/* Controls & Messages Section */}
                        <Panel variant="well" style={{ padding: '1rem', flex: '3', maxHeight: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <Toolbar style={{ marginBottom: '1rem' }}>
                                    <Button
                                        onClick={() => sendMessage('start')}
                                        disabled={!isConnected || botStatus.isRunning}
                                    >
                                        Start Bot
                                    </Button>
                                    <Button
                                        onClick={() => sendMessage('stop')}
                                        disabled={!isConnected || !botStatus.isRunning}
                                    >
                                        Stop Bot
                                    </Button>
                                    <Button
                                        onClick={() => sendMessage('status')}
                                        disabled={!isConnected}
                                    >
                                        Check Status
                                    </Button>
                                    <Button
                                        onClick={() => setMessages([])}
                                        disabled={!isConnected}
                                    >
                                        Clear Log
                                    </Button>
                                </Toolbar>
                            </div>

                            <Panel variant="well" style={{ flex: 1, overflowY: 'auto' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableHeadCell style={{ width: '150px' }}>Time</TableHeadCell>
                                            <TableHeadCell style={{ width: '100px' }}>Type</TableHeadCell>
                                            <TableHeadCell>Message</TableHeadCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {messages.map((message, index) => (
                                            <TableRow key={index}>
                                                <TableDataCell>
                                                    {new Date(message.timestamp).toLocaleTimeString()}
                                                </TableDataCell>
                                                <TableDataCell>
                                                    {message.type === 'buy_order' && '💰 '}
                                                    {message.type === 'error' && '⚠️ '}
                                                    {message.type === 'status' && '📊 '}
                                                    {message.type}
                                                </TableDataCell>
                                                <TableDataCell style={{
                                                    color: message.type === 'error' ? '#e74c3c' :
                                                        message.type === 'buy_order' ? 'green' :
                                                            'inherit'
                                                }}>
                                                    {typeof message.content === 'string' ?
                                                        message.content :
                                                        JSON.stringify(message.content)}
                                                </TableDataCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Panel>
                        </Panel>

                        {/* Positions Section */}
                        <Panel variant="well" style={{ padding: '1rem', flex: '2' }}>
                            <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Active Positions</div>
                            <Panel variant="well" style={{ padding: '0.5rem', marginBottom: '1rem' }}>
                                <p>🔄 Auto-refreshing status</p>
                            </Panel>

                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeadCell>Symbol</TableHeadCell>
                                        <TableHeadCell style={{ width: 100 }}>Entry</TableHeadCell>
                                        <TableHeadCell style={{ width: 100 }}>Current</TableHeadCell>
                                        <TableHeadCell style={{ width: 80 }}>PnL</TableHeadCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {botStatus.positions.map((position, index) => (
                                        <TableRow key={index}>
                                            <TableDataCell>{position.symbol}</TableDataCell>
                                            <TableDataCell>{position.entry_price}</TableDataCell>
                                            <TableDataCell>{position.current_price}</TableDataCell>
                                            <TableDataCell style={{
                                                color: position.pnl >= 0 ? '#2ecc71' : '#e74c3c'
                                            }}>
                                                {position.pnl}%
                                            </TableDataCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Panel>
                    </div>
                </WindowContent>
            </Window>
        </Modal>
    );
}

const FilterConfigModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [filters, setFilters] = useState({
        // Original filters
        minLiquidity: 1000,
        maxLiquidity: 1000000,
        minMarketCap: 2000,
        maxMarketCap: 10000000,
        minRiskScore: 0,
        maxRiskScore: 3,
        requireSocialData: true,
        markets: ['raydium', 'orca', 'pumpfun', 'moonshot', 'raydium-cpmm'],

        // Developer filters
        creatorWhitelist: [],
        creatorBlacklist: [],
        minCreatorBuy: 0,
        firstTimeCreatorOnly: false,
        skipIfDevOut: false,
        skipBundles: false,
        advancedRugCheck: false,

        // Bonding curve filters
        minBuyTx: 0,
        maxSingleBuy: 0,
        minBondingProgress: 0,
        maxBondingProgress: 100,
        minTokenAge: 0,
        maxTokenAge: 0,

        // Volume filters
        minSolDelta: 0,
        minTxTimeframe: 0,
        minTxCount: 0,

        // Metadata filters
        nameContains: [],
        nameNotContains: [],
        descriptionContains: [],
        descriptionNotContains: [],
        urlContains: [],
        urlNotContains: [],
        tokenAddressContains: [],
        tokenAddressNotContains: [],
        tickerWhitelist: [],
        tickerBlacklist: [],

        // Social filters
        websiteRequired: 'optional',
        twitterRequired: 'optional',
        telegramRequired: 'optional',
        requireAtLeastOneSocial: false,
        noSocials: false,

        // Unique filters
        uniqueWebsite: false,
        uniqueTelegram: false,
        uniqueTwitter: false,
        uniqueName: false,
        uniqueTicker: false,
        uniqueImage: false,

        // Copy trade filters
        minInitialBuy: 0,
        maxInitialBuy: 0,
        minBondingCurve: 0,
        maxBondingCurve: 100,
        startOnFirstBuyOnly: false,
        tradeSameAmounts: false,
        copySellTrades: false,
        sellAllOnAnySell: false,
        allowRepurchase: false,

        // Telegram/Discord filters
        allowEditedMessages: false,
        messageContainsList: [],
        messageNotContainsList: [],
        skipBotMessages: false,

        // Other filters
        sellOnRaydiumOnly: false,
        inactivityTimeout: 0,
        sellAfterSeconds: 0,
        sellAtPNL: 0
    });

    useEffect(() => {
        if (isOpen) {
            fetch('http://localhost:3001/filters')
                .then(res => res.json())
                .then(data => setFilters(prev => ({ ...prev, ...data })))
                .catch(err => console.error('Error fetching filters:', err));
        }
    }, [isOpen]);

    const handleSave = async () => {
        try {
            const response = await fetch('http://localhost:3001/filters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filters)
            });

            if (!response.ok) throw new Error('Failed to update filters');
            onClose();
        } catch (error) {
            console.error('Error saving filters:', error);
        }
    };

    const renderBasicTab = () => (
        <div className="space-y-4">
            <Fieldset label="Trading Parameters">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label>Min Liquidity</label>
                        <NumberField
                            value={filters.minLiquidity}
                            onChange={val => setFilters(prev => ({ ...prev, minLiquidity: val }))}
                            min={0}
                        />
                    </div>
                    <div>
                        <label>Max Liquidity</label>
                        <NumberField
                            value={filters.maxLiquidity}
                            onChange={val => setFilters(prev => ({ ...prev, maxLiquidity: val }))}
                            min={0}
                        />
                    </div>
                    <div>
                        <label>Min Market Cap</label>
                        <NumberField
                            value={filters.minMarketCap}
                            onChange={val => setFilters(prev => ({ ...prev, minMarketCap: val }))}
                            min={0}
                        />
                    </div>
                    <div>
                        <label>Max Market Cap</label>
                        <NumberField
                            value={filters.maxMarketCap}
                            onChange={val => setFilters(prev => ({ ...prev, maxMarketCap: val }))}
                            min={0}
                        />
                    </div>
                </div>
            </Fieldset>

            <Fieldset label="Markets">
                <div className="flex flex-wrap gap-2">
                    {['raydium', 'orca', 'pumpfun', 'moonshot', 'raydium-cpmm'].map(market => (
                        <Button
                            key={market}
                            onClick={() => {
                                setFilters(prev => ({
                                    ...prev,
                                    markets: prev.markets.includes(market)
                                        ? prev.markets.filter(m => m !== market)
                                        : [...prev.markets, market]
                                }));
                            }}
                            variant={filters.markets.includes(market) ? 'flat' : 'default'}
                        >
                            {market}
                        </Button>
                    ))}
                </div>
            </Fieldset>
        </div>
    );

    const renderLiquidityTab = () => (
        <div className="space-y-4">
            <Fieldset label="Liquidity Range">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label>Min Liquidity ($)</label>
                        <NumberField
                            value={filters.minLiquidity}
                            onChange={value => setFilters(prev => ({ ...prev, minLiquidity: value }))}
                            min={0}
                        />
                    </div>
                    <div>
                        <label>Max Liquidity ($)</label>
                        <NumberField
                            value={filters.maxLiquidity}
                            onChange={value => setFilters(prev => ({ ...prev, maxLiquidity: value }))}
                            min={0}
                        />
                    </div>
                </div>
            </Fieldset>

            <Fieldset label="Market Selection">
                <div className="flex flex-wrap gap-2">
                    {['raydium', 'orca', 'pumpfun', 'moonshot', 'raydium-cpmm'].map(market => (
                        <Button
                            key={market}
                            onClick={() => {
                                setFilters(prev => ({
                                    ...prev,
                                    markets: prev.markets.includes(market)
                                        ? prev.markets.filter(m => m !== market)
                                        : [...prev.markets, market]
                                }));
                            }}
                            className={filters.markets.includes(market) ? 'bg-blue-600 text-white' : ''}
                        >
                            {market}
                        </Button>
                    ))}
                </div>
            </Fieldset>
        </div>
    );

    const renderDeveloperTab = () => (
        <div className="space-y-4">
            <Fieldset label="Creator Settings">
                <div className="space-y-2">
                    <TextInput
                        placeholder="Add creator to whitelist"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                setFilters(prev => ({
                                    ...prev,
                                    creatorWhitelist: [...prev.creatorWhitelist, e.target.value]
                                }));
                                e.target.value = '';
                            }
                        }}
                    />
                    <div className="flex flex-wrap gap-2">
                        {filters.creatorWhitelist.map(creator => (
                            <Button
                                key={creator}
                                onClick={() => {
                                    setFilters(prev => ({
                                        ...prev,
                                        creatorWhitelist: prev.creatorWhitelist.filter(c => c !== creator)
                                    }));
                                }}
                            >
                                {creator} ×
                            </Button>
                        ))}
                    </div>
                </div>
            </Fieldset>

            <Fieldset label="Developer Checks">
                <div className="space-y-2">
                    <Checkbox
                        checked={filters.firstTimeCreatorOnly}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            firstTimeCreatorOnly: !prev.firstTimeCreatorOnly
                        }))}
                        label="First Time Creator Only"
                    />
                    <Checkbox
                        checked={filters.skipIfDevOut}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            skipIfDevOut: !prev.skipIfDevOut
                        }))}
                        label="Skip if Developer is Out"
                    />
                    <Checkbox
                        checked={filters.advancedRugCheck}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            advancedRugCheck: !prev.advancedRugCheck
                        }))}
                        label="Advanced Rug Check"
                    />
                </div>
            </Fieldset>
        </div>
    );

    const renderSocialTab = () => (
        <div className="space-y-4">
            <Fieldset label="Social Requirements">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label>Website</label>
                        <Select
                            value={filters?.websiteRequired}
                            onChange={e => setFilters(prev => ({
                                ...prev,
                                websiteRequired: e.target.value
                            }))}
                            options={[
                                { value: 'required', label: 'Required' },
                                { value: 'forbidden', label: 'Forbidden' },
                                { value: 'optional', label: 'Optional' }
                            ]}
                        />
                    </div>
                    <div>
                        <label>Twitter</label>
                        <Select
                            value={filters?.twitterRequired}
                            onChange={e => setFilters(prev => ({
                                ...prev,
                                twitterRequired: e.target.value
                            }))}
                            options={[
                                { value: 'required', label: 'Required' },
                                { value: 'forbidden', label: 'Forbidden' },
                                { value: 'optional', label: 'Optional' }
                            ]}
                        />
                    </div>
                    <div>
                        <label>Telegram</label>
                        <Select
                            value={filters?.telegramRequired}
                            onChange={e => setFilters(prev => ({
                                ...prev,
                                telegramRequired: e.target.value
                            }))}
                            options={[
                                { value: 'required', label: 'Required' },
                                { value: 'forbidden', label: 'Forbidden' },
                                { value: 'optional', label: 'Optional' }
                            ]}
                        />
                    </div>
                </div>
            </Fieldset>

            <Fieldset label="Social Verification">
                <div className="space-y-2">
                    <Checkbox
                        checked={filters.uniqueWebsite}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            uniqueWebsite: !prev.uniqueWebsite
                        }))}
                        label="Require Unique Website"
                    />
                    <Checkbox
                        checked={filters.uniqueTwitter}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            uniqueTwitter: !prev.uniqueTwitter
                        }))}
                        label="Require Unique Twitter"
                    />
                    <Checkbox
                        checked={filters.uniqueTelegram}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            uniqueTelegram: !prev.uniqueTelegram
                        }))}
                        label="Require Unique Telegram"
                    />
                </div>
            </Fieldset>
        </div>
    );

    const renderCopyTradeTab = () => (
        <div className="space-y-4">
            <Fieldset label="Copy Trade Settings">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label>Min Initial Buy</label>
                        <NumberField
                            value={filters.minInitialBuy}
                            onChange={value => setFilters(prev => ({ ...prev, minInitialBuy: value }))}
                            min={0}
                        />
                    </div>
                    <div>
                        <label>Max Initial Buy</label>
                        <NumberField
                            value={filters.maxInitialBuy}
                            onChange={value => setFilters(prev => ({ ...prev, maxInitialBuy: value }))}
                            min={0}
                        />
                    </div>
                </div>

                <div className="space-y-2 mt-4">
                    <Checkbox
                        checked={filters.startOnFirstBuyOnly}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            startOnFirstBuyOnly: !prev.startOnFirstBuyOnly
                        }))}
                        label="Start on First Buy Only"
                    />
                    <Checkbox
                        checked={filters.tradeSameAmounts}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            tradeSameAmounts: !prev.tradeSameAmounts
                        }))}
                        label="Trade Same Amounts"
                    />
                    <Checkbox
                        checked={filters.copySellTrades}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            copySellTrades: !prev.copySellTrades
                        }))}
                        label="Copy Sell Trades"
                    />
                </div>
            </Fieldset>
        </div>
    );

    const renderOtherTab = () => (
        <div className="space-y-4">
            <Fieldset label="Exit Strategy">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label>Inactivity Timeout (seconds)</label>
                        <NumberField
                            value={filters.inactivityTimeout}
                            onChange={value => setFilters(prev => ({ ...prev, inactivityTimeout: value }))}
                            min={0}
                        />
                    </div>
                    <div>
                        <label>Sell After (seconds)</label>
                        <NumberField
                            value={filters.sellAfterSeconds}
                            onChange={value => setFilters(prev => ({ ...prev, sellAfterSeconds: value }))}
                            min={0}
                        />
                    </div>
                    <div>
                        <label>Sell at PNL (%)</label>
                        <NumberField
                            value={filters.sellAtPNL}
                            onChange={value => setFilters(prev => ({ ...prev, sellAtPNL: value }))}
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <Checkbox
                        checked={filters.sellOnRaydiumOnly}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            sellOnRaydiumOnly: !prev.sellOnRaydiumOnly
                        }))}
                        label="Sell on Raydium Only"
                    />
                </div>
            </Fieldset>
        </div>
    );

    const renderMetadataTab = () => (
        <div className="space-y-4">
            <Fieldset label="Name Filters">
                <div className="space-y-2">
                    <div>
                        <TextInput
                            placeholder="Name Contains (Press Enter to add)"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    setFilters(prev => ({
                                        ...prev,
                                        nameContains: [...prev.nameContains, e.target.value.trim()]
                                    }));
                                    e.target.value = '';
                                }
                            }}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {filters?.nameContains?.map((term, index) => (
                                <Button
                                    key={index}
                                    onClick={() => {
                                        setFilters(prev => ({
                                            ...prev,
                                            nameContains: prev.nameContains.filter((_, i) => i !== index)
                                        }));
                                    }}
                                    variant="menu"
                                    size="sm"
                                >
                                    {term} ×
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <TextInput
                            placeholder="Name Not Contains (Press Enter to add)"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    setFilters(prev => ({
                                        ...prev,
                                        nameNotContains: [...prev.nameNotContains, e.target.value.trim()]
                                    }));
                                    e.target.value = '';
                                }
                            }}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {filters?.nameNotContains?.map((term, index) => (
                                <Button
                                    key={index}
                                    onClick={() => {
                                        setFilters(prev => ({
                                            ...prev,
                                            nameNotContains: prev.nameNotContains.filter((_, i) => i !== index)
                                        }));
                                    }}
                                    variant="menu"
                                    size="sm"
                                >
                                    {term} ×
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </Fieldset>

            <Fieldset label="Description Filters">
                <div className="space-y-2">
                    <div>
                        <TextInput
                            placeholder="Description Contains (Press Enter to add)"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    setFilters(prev => ({
                                        ...prev,
                                        descriptionContains: [...prev.descriptionContains, e.target.value.trim()]
                                    }));
                                    e.target.value = '';
                                }
                            }}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {filters?.descriptionContains?.map((term, index) => (
                                <Button
                                    key={index}
                                    onClick={() => {
                                        setFilters(prev => ({
                                            ...prev,
                                            descriptionContains: prev.descriptionContains.filter((_, i) => i !== index)
                                        }));
                                    }}
                                    variant="menu"
                                    size="sm"
                                >
                                    {term} ×
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <TextInput
                            placeholder="Description Not Contains (Press Enter to add)"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    setFilters(prev => ({
                                        ...prev,
                                        descriptionNotContains: [...prev.descriptionNotContains, e.target.value.trim()]
                                    }));
                                    e.target.value = '';
                                }
                            }}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {filters?.descriptionNotContains?.map((term, index) => (
                                <Button
                                    key={index}
                                    onClick={() => {
                                        setFilters(prev => ({
                                            ...prev,
                                            descriptionNotContains: prev.descriptionNotContains.filter((_, i) => i !== index)
                                        }));
                                    }}
                                    variant="menu"
                                    size="sm"
                                >
                                    {term} ×
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </Fieldset>

            <Fieldset label="Website URL Filters">
                <div className="space-y-2">
                    <div>
                        <TextInput
                            placeholder="Website Contains (Press Enter to add)"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    setFilters(prev => ({
                                        ...prev,
                                        websiteContains: [...prev.websiteContains, e.target.value.trim()]
                                    }));
                                    e.target.value = '';
                                }
                            }}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {filters?.websiteContains?.map((term, index) => (
                                <Button
                                    key={index}
                                    onClick={() => {
                                        setFilters(prev => ({
                                            ...prev,
                                            websiteContains: prev.websiteContains.filter((_, i) => i !== index)
                                        }));
                                    }}
                                    variant="menu"
                                    size="sm"
                                >
                                    {term} ×
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <TextInput
                            placeholder="Website Not Contains (Press Enter to add)"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    setFilters(prev => ({
                                        ...prev,
                                        websiteNotContains: [...prev.websiteNotContains, e.target.value.trim()]
                                    }));
                                    e.target.value = '';
                                }
                            }}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {filters?.websiteNotContains?.map((term, index) => (
                                <Button
                                    key={index}
                                    onClick={() => {
                                        setFilters(prev => ({
                                            ...prev,
                                            websiteNotContains: prev.websiteNotContains.filter((_, i) => i !== index)
                                        }));
                                    }}
                                    variant="menu"
                                    size="sm"
                                >
                                    {term} ×
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </Fieldset>

            <Fieldset label="Token Address Filters">
                <div className="space-y-2">
                    <div>
                        <TextInput
                            placeholder="Token Address Contains (Press Enter to add)"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    setFilters(prev => ({
                                        ...prev,
                                        tokenAddressContains: [...prev.tokenAddressContains, e.target.value.trim()]
                                    }));
                                    e.target.value = '';
                                }
                            }}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {filters?.tokenAddressContains?.map((term, index) => (
                                <Button
                                    key={index}
                                    onClick={() => {
                                        setFilters(prev => ({
                                            ...prev,
                                            tokenAddressContains: prev.tokenAddressContains.filter((_, i) => i !== index)
                                        }));
                                    }}
                                    variant="menu"
                                    size="sm"
                                >
                                    {term} ×
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </Fieldset>

            <Fieldset label="Ticker Lists">
                <div className="space-y-2">
                    <div>
                        <TextInput
                            placeholder="Add ticker to whitelist (Press Enter to add)"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    setFilters(prev => ({
                                        ...prev,
                                        tickerWhitelist: [...prev.tickerWhitelist, e.target.value.trim().toUpperCase()]
                                    }));
                                    e.target.value = '';
                                }
                            }}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {filters?.tickerWhitelist?.map((ticker, index) => (
                                <Button
                                    key={index}
                                    onClick={() => {
                                        setFilters(prev => ({
                                            ...prev,
                                            tickerWhitelist: prev.tickerWhitelist.filter((_, i) => i !== index)
                                        }));
                                    }}
                                    variant="menu"
                                    size="sm"
                                >
                                    {ticker} ×
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <TextInput
                            placeholder="Add ticker to blacklist (Press Enter to add)"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    setFilters(prev => ({
                                        ...prev,
                                        tickerBlacklist: [...prev.tickerBlacklist, e.target.value.trim().toUpperCase()]
                                    }));
                                    e.target.value = '';
                                }
                            }}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {filters?.tickerBlacklist?.map((ticker, index) => (
                                <Button
                                    key={index}
                                    onClick={() => {
                                        setFilters(prev => ({
                                            ...prev,
                                            tickerBlacklist: prev.tickerBlacklist.filter((_, i) => i !== index)
                                        }));
                                    }}
                                    variant="menu"
                                    size="sm"
                                >
                                    {ticker} ×
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </Fieldset>
        </div>
    );

    const renderVolumeTab = () => (
        <div className="space-y-4">
            <Fieldset label="Volume Requirements">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label>Min SOL Delta</label>
                        <NumberField
                            value={filters.minSolDelta}
                            onChange={value => setFilters(prev => ({
                                ...prev,
                                minSolDelta: value
                            }))}
                            min={0}
                            step={0.1}
                        />
                    </div>
                    <span className="text-xs text-gray-600 mb-4" style={{ marginBottom: '10rem' }}>
                        Minimum SOL volume change required
                    </span>
                    <div>
                        <label>Timeframe (minutes)</label>
                        <NumberField
                            value={filters.txTimeframe}
                            onChange={value => setFilters(prev => ({
                                ...prev,
                                txTimeframe: value
                            }))}
                            min={1}
                            max={1440} // 24 hours
                        />
                    </div>
                    <span className="text-xs text-gray-600 mb-2">
                        Time window to check transactions
                    </span>
                </div>
            </Fieldset>

            <Fieldset label="Transaction Counts">
                <div className="space-y-4">
                    <div>
                        <label>Minimum Transactions in Timeframe</label>
                        <NumberField
                            value={filters.minTxCount}
                            onChange={value => setFilters(prev => ({
                                ...prev,
                                minTxCount: value
                            }))}
                            min={0}
                        />
                    </div>
                    <span className="text-xs text-gray-600">
                        Minimum number of transactions required within the specified timeframe
                    </span>
                </div>
            </Fieldset>

            <Fieldset label="Volume Alerts">
                <div className="space-y-2">
                    <Checkbox
                        checked={filters.alertOnVolumeSpike}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            alertOnVolumeSpike: !prev.alertOnVolumeSpike
                        }))}
                        label="Alert on Volume Spikes"
                    />

                    {filters.alertOnVolumeSpike && (
                        <div className="ml-6 space-y-2">
                            <div>
                                <label>Volume Spike Threshold (%)</label>
                                <NumberField
                                    value={filters.volumeSpikeThreshold}
                                    onChange={value => setFilters(prev => ({
                                        ...prev,
                                        volumeSpikeThreshold: value
                                    }))}
                                    min={0}
                                    step={5}
                                />
                                <span className="text-xs text-gray-600">
                                    Percentage increase in volume to trigger alert
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </Fieldset>

            <Fieldset label="Advanced Volume Settings">
                <div className="space-y-2">
                    <Checkbox
                        checked={filters.excludeWhaleTx}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            excludeWhaleTx: !prev.excludeWhaleTx
                        }))}
                        label="Exclude Whale Transactions"
                    />

                    {filters.excludeWhaleTx && (
                        <div className="ml-6">
                            <label>Whale Transaction Threshold (SOL)</label>
                            <NumberField
                                value={filters.whaleTxThreshold}
                                onChange={value => setFilters(prev => ({
                                    ...prev,
                                    whaleTxThreshold: value
                                }))}
                                min={0}
                                step={1}
                            />
                            <span className="text-xs text-gray-600">
                                Transactions above this amount will be excluded from volume calculations
                            </span>
                        </div>
                    )}

                    <Checkbox
                        checked={filters.requireSteadyVolume}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            requireSteadyVolume: !prev.requireSteadyVolume
                        }))}
                        label="Require Steady Volume"
                    />

                    {filters.requireSteadyVolume && (
                        <div className="ml-6">
                            <label>Max Volume Variance (%)</label>
                            <NumberField
                                value={filters.maxVolumeVariance}
                                onChange={value => setFilters(prev => ({
                                    ...prev,
                                    maxVolumeVariance: value
                                }))}
                                min={0}
                                max={100}
                                step={5}
                            />
                            <span className="text-xs text-gray-600">
                                Maximum allowed variance in volume between time periods
                            </span>
                        </div>
                    )}
                </div>
            </Fieldset>
        </div>
    );

    const renderBondingTab = () => (
        <div className="space-y-4">
            <Fieldset label="Transaction Requirements">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label>Minimum Buy Transactions</label>
                        <NumberField
                            value={filters.minBuyTx}
                            onChange={value => setFilters(prev => ({
                                ...prev,
                                minBuyTx: value
                            }))}
                            min={0}
                        />
                    </div>
                    <span className="text-xs text-gray-600">
                        Minimum number of buy transactions required
                    </span>

                    <div>
                        <label>Maximum Single Buy (SOL)</label>
                        <NumberField
                            value={filters.maxSingleBuy}
                            onChange={value => setFilters(prev => ({
                                ...prev,
                                maxSingleBuy: value
                            }))}
                            min={0}
                            step={0.1}
                        />
                    </div>
                    <span className="text-xs text-gray-600">
                        Maximum size of any single buy transaction
                    </span>
                </div>
            </Fieldset>

            <Fieldset label="Bonding Curve Progress">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label>Min Progress (%)</label>
                        <NumberField
                            value={filters.minBondingProgress}
                            onChange={value => setFilters(prev => ({
                                ...prev,
                                minBondingProgress: value
                            }))}
                            min={0}
                            max={100}
                            step={1}
                        />
                    </div>
                    <span className="text-xs text-gray-600">
                        Minimum progress along the bonding curve
                    </span>

                    <div>
                        <label>Max Progress (%)</label>
                        <NumberField
                            value={filters.maxBondingProgress}
                            onChange={value => setFilters(prev => ({
                                ...prev,
                                maxBondingProgress: value
                            }))}
                            min={0}
                            max={100}
                            step={1}
                        />
                    </div>
                    <span className="text-xs text-gray-600">
                        Maximum progress along the bonding curve
                    </span>
                </div>

                <div className="mt-4 space-y-2">
                    <Checkbox
                        checked={filters.skipHighProgress}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            skipHighProgress: !prev.skipHighProgress
                        }))}
                        label="Skip High Progress Tokens"
                    />

                    <Checkbox
                        checked={filters.requireSteadyProgress}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            requireSteadyProgress: !prev.requireSteadyProgress
                        }))}
                        label="Require Steady Progress"
                    />
                </div>
            </Fieldset>

            <Fieldset label="Token Age">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label>Min Token Age (hours)</label>
                        <NumberField
                            value={filters.minTokenAge}
                            onChange={value => setFilters(prev => ({
                                ...prev,
                                minTokenAge: value
                            }))}
                            min={0}
                        />
                    </div>
                    <span className="text-xs text-gray-600">
                        Minimum age of token since creation
                    </span>

                    <div>
                        <label>Max Token Age (hours)</label>
                        <NumberField
                            value={filters.maxTokenAge}
                            onChange={value => setFilters(prev => ({
                                ...prev,
                                maxTokenAge: value
                            }))}
                            min={0}
                        />
                    </div>
                    <span className="text-xs text-gray-600">
                        Maximum age of token since creation
                    </span>
                </div>

                <div className="mt-4 space-y-2">
                    <Checkbox
                        checked={filters.excludeNewTokens}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            excludeNewTokens: !prev.excludeNewTokens
                        }))}
                        label="Exclude Brand New Tokens"
                    />

                    {filters.excludeNewTokens && (
                        <>
                            <div className="ml-6">
                                <label>Minimum Initial Age (hours)</label>
                                <NumberField
                                    value={filters.minInitialAge}
                                    onChange={value => setFilters(prev => ({
                                        ...prev,
                                        minInitialAge: value
                                    }))}
                                    min={0}
                                />
                            </div>
                            <span className="text-xs text-gray-600">
                                Tokens younger than this will be skipped
                            </span></>
                    )}
                </div>
            </Fieldset>

            <Fieldset label="Advanced Bonding Settings">
                <div className="space-y-2">
                    <Checkbox
                        checked={filters.checkBuyPressure}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            checkBuyPressure: !prev.checkBuyPressure
                        }))}
                        label="Check Buy Pressure"
                    />

                    {filters.checkBuyPressure && (
                        <div className="ml-6">
                            <label>Min Buy/Sell Ratio</label>
                            <NumberField
                                value={filters.minBuySellRatio}
                                onChange={value => setFilters(prev => ({
                                    ...prev,
                                    minBuySellRatio: value
                                }))}
                                min={0}
                                step={0.1}
                            />
                            <span className="text-xs text-gray-600">
                                Minimum ratio of buys to sells required
                            </span>
                        </div>
                    )}

                    <Checkbox
                        checked={filters.preventFrontrunning}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            preventFrontrunning: !prev.preventFrontrunning
                        }))}
                        label="Prevent Frontrunning"
                    />

                    <Checkbox
                        checked={filters.requireLinearGrowth}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            requireLinearGrowth: !prev.requireLinearGrowth
                        }))}
                        label="Require Linear Growth"
                    />
                </div>
            </Fieldset>
        </div>
    );

    const renderAfkTab = () => (
        <div className="space-y-4">
            <Fieldset label="AFK Mode">
                <div className="space-y-2">
                    <Checkbox
                        checked={filters.afkMode}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            afkMode: !prev.afkMode
                        }))}
                        label="Enable AFK Mode"
                    />

                    {filters.afkMode && (
                        <div className="ml-4 mt-4 space-y-4">
                            <div>
                                <label>Auto-Sell After (minutes)</label>
                                <NumberField
                                    value={filters.afkAutoSellTime}
                                    onChange={value => setFilters(prev => ({
                                        ...prev,
                                        afkAutoSellTime: value
                                    }))}
                                    min={1}
                                    step={1}
                                />
                                <span className="text-xs text-gray-600">
                                    Automatically sell position after this many minutes
                                </span>
                            </div>

                            <div>
                                <label>Take Profit at (%)</label>
                                <NumberField
                                    value={filters.afkTakeProfit}
                                    onChange={value => setFilters(prev => ({
                                        ...prev,
                                        afkTakeProfit: value
                                    }))}
                                    min={0}
                                    step={1}
                                />
                                <span className="text-xs text-gray-600">
                                    Exit position when profit reaches this percentage
                                </span>
                            </div>

                            <div>
                                <label>Stop Loss at (%)</label>
                                <NumberField
                                    value={filters.afkStopLoss}
                                    onChange={value => setFilters(prev => ({
                                        ...prev,
                                        afkStopLoss: value
                                    }))}
                                    min={0}
                                    step={1}
                                />
                                <span className="text-xs text-gray-600">
                                    Exit position when loss reaches this percentage
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </Fieldset>

            <Fieldset label="Market Conditions">
                <div className="space-y-2">
                    <Checkbox
                        checked={filters.afkMarketCheck}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            afkMarketCheck: !prev.afkMarketCheck
                        }))}
                        label="Check Market Conditions"
                    />

                    {filters.afkMarketCheck && (
                        <div className="ml-4 mt-4 space-y-4">
                            <div>
                                <label>Market Volume Threshold (SOL)</label>
                                <NumberField
                                    value={filters.afkMinMarketVolume}
                                    onChange={value => setFilters(prev => ({
                                        ...prev,
                                        afkMinMarketVolume: value
                                    }))}
                                    min={0}
                                    step={1}
                                />
                                <span className="text-xs text-gray-600">
                                    Minimum market volume required for trades
                                </span>
                            </div>

                            <Checkbox
                                checked={filters.afkWaitForRecovery}
                                onChange={() => setFilters(prev => ({
                                    ...prev,
                                    afkWaitForRecovery: !prev.afkWaitForRecovery
                                }))}
                                label="Wait for Market Recovery"
                            />
                        </div>
                    )}
                </div>
            </Fieldset>

            <Fieldset label="Position Management">
                <div className="space-y-4">
                    <div>
                        <label>Max Concurrent Positions</label>
                        <NumberField
                            value={filters.afkMaxPositions}
                            onChange={value => setFilters(prev => ({
                                ...prev,
                                afkMaxPositions: value
                            }))}
                            min={1}
                            step={1}
                        />
                    </div>
                    <span className="text-xs text-gray-600">
                        Maximum number of positions to hold while in AFK mode
                    </span>

                    <div className="space-y-2">
                        <Checkbox
                            checked={filters.afkScaleOut}
                            onChange={() => setFilters(prev => ({
                                ...prev,
                                afkScaleOut: !prev.afkScaleOut
                            }))}
                            label="Enable Scale Out"
                        />

                        {filters.afkScaleOut && (
                            <div className="ml-4 space-y-2">
                                <div>
                                    <label>Scale Out Steps</label>
                                    <NumberField
                                        value={filters.afkScaleOutSteps}
                                        onChange={value => setFilters(prev => ({
                                            ...prev,
                                            afkScaleOutSteps: value
                                        }))}
                                        min={2}
                                        max={10}
                                        step={1}
                                    />
                                </div>
                                <div>
                                    <label>Step Percentage (%)</label>
                                    <NumberField
                                        value={filters.afkStepPercentage}
                                        onChange={value => setFilters(prev => ({
                                            ...prev,
                                            afkStepPercentage: value
                                        }))}
                                        min={1}
                                        max={100}
                                        step={1}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Fieldset>

            <Fieldset label="Notifications">
                <div className="space-y-2">
                    <Checkbox
                        checked={filters.afkNotifications}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            afkNotifications: !prev.afkNotifications
                        }))}
                        label="Enable AFK Notifications"
                    />

                    {filters.afkNotifications && (
                        <div className="ml-4 space-y-2">
                            <span>

                                <Checkbox
                                    checked={filters.afkNotifyOnEntry}
                                    onChange={() => setFilters(prev => ({
                                        ...prev,
                                        afkNotifyOnEntry: !prev.afkNotifyOnEntry
                                    }))}
                                    label="Notify on Entry"
                                />
                                <Checkbox
                                    checked={filters.afkNotifyOnExit}
                                    onChange={() => setFilters(prev => ({
                                        ...prev,
                                        afkNotifyOnExit: !prev.afkNotifyOnExit
                                    }))}
                                    label="Notify on Exit"
                                />
                                <Checkbox
                                    checked={filters.afkNotifyOnError}
                                    onChange={() => setFilters(prev => ({
                                        ...prev,
                                        afkNotifyOnError: !prev.afkNotifyOnError
                                    }))}
                                    label="Notify on Errors"
                                />
                            </span>
                        </div>
                    )}
                </div>
            </Fieldset>
        </div>
    );

    const renderTelegramTab = () => (
        <div className="space-y-4">
            <Fieldset label="Message Settings">
                <div className="space-y-2">
                    <Checkbox
                        checked={filters.allowEditedMessages}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            allowEditedMessages: !prev.allowEditedMessages
                        }))}
                        label="Allow Edited Messages"
                    />

                    <Checkbox
                        checked={filters.skipBotMessages}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            skipBotMessages: !prev.skipBotMessages
                        }))}
                        label="Skip Bot Messages"
                    />

                    <div className="mt-4" >
                        <label>Message Processing Delay (seconds)</label>
                        <NumberField
                            value={filters.messageDelay}
                            onChange={value => setFilters(prev => ({
                                ...prev,
                                messageDelay: value
                            }))}
                            min={0}
                            max={60}
                            step={1}
                            style={{ maxWidth: '3rem' }}
                        />
                    </div>
                    <span className="text-xs text-gray-600">
                        Wait time before processing new messages
                    </span>
                </div>
            </Fieldset>

            <Fieldset label="Content Filters">
                <div className="space-y-4">
                    <div>
                        <label>Message Must Contain</label>
                        <TextInput
                            placeholder="Add required term (Press Enter)"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    setFilters(prev => ({
                                        ...prev,
                                        messageContainsList: [...prev.messageContainsList, e.target.value.trim()]
                                    }));
                                    e.target.value = '';
                                }
                            }}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {filters?.messageContainsList?.map((term, index) => (
                                <Button
                                    key={index}
                                    onClick={() => {
                                        setFilters(prev => ({
                                            ...prev,
                                            messageContainsList: prev.messageContainsList.filter((_, i) => i !== index)
                                        }));
                                    }}
                                    variant="menu"
                                    size="sm"
                                >
                                    {term} ×
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label>Message Must Not Contain</label>
                        <TextInput
                            placeholder="Add excluded term (Press Enter)"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    setFilters(prev => ({
                                        ...prev,
                                        messageExcludeList: [...prev.messageExcludeList, e.target.value.trim()]
                                    }));
                                    e.target.value = '';
                                }
                            }}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {filters?.messageExcludeList?.map((term, index) => (
                                <Button
                                    key={index}
                                    onClick={() => {
                                        setFilters(prev => ({
                                            ...prev,
                                            messageExcludeList: prev.messageExcludeList.filter((_, i) => i !== index)
                                        }));
                                    }}
                                    variant="menu"
                                    size="sm"
                                >
                                    {term} ×
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </Fieldset>

            <Fieldset label="Channel Settings">
                <div className="space-y-4">
                    <div>
                        <label>Monitored Channels</label>
                        <TextInput
                            placeholder="Add channel ID (Press Enter)"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    setFilters(prev => ({
                                        ...prev,
                                        monitoredChannels: [...prev.monitoredChannels, e.target.value.trim()]
                                    }));
                                    e.target.value = '';
                                }
                            }}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {filters?.monitoredChannels?.map((channel, index) => (
                                <Button
                                    key={index}
                                    onClick={() => {
                                        setFilters(prev => ({
                                            ...prev,
                                            monitoredChannels: prev.monitoredChannels.filter((_, i) => i !== index)
                                        }));
                                    }}
                                    variant="menu"
                                    size="sm"
                                >
                                    {channel} ×
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label>Ignored Channels</label>
                        <TextInput
                            placeholder="Add channel ID to ignore (Press Enter)"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    setFilters(prev => ({
                                        ...prev,
                                        ignoredChannels: [...prev.ignoredChannels, e.target.value.trim()]
                                    }));
                                    e.target.value = '';
                                }
                            }}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {filters?.ignoredChannels?.map((channel, index) => (
                                <Button
                                    key={index}
                                    onClick={() => {
                                        setFilters(prev => ({
                                            ...prev,
                                            ignoredChannels: prev.ignoredChannels.filter((_, i) => i !== index)
                                        }));
                                    }}
                                    variant="menu"
                                    size="sm"
                                >
                                    {channel} ×
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </Fieldset>

            <Fieldset label="Advanced Filters">
                <div className="space-y-2">
                    <Checkbox
                        checked={filters.requireMarketCap}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            requireMarketCap: !prev.requireMarketCap
                        }))}
                        label="Require Market Cap in Message"
                    />

                    <Checkbox
                        checked={filters.requireTokenAddress}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            requireTokenAddress: !prev.requireTokenAddress
                        }))}
                        label="Require Token Address in Message"
                    />

                    <Checkbox
                        checked={filters.requireMultipleMessages}
                        onChange={() => setFilters(prev => ({
                            ...prev,
                            requireMultipleMessages: !prev.requireMultipleMessages
                        }))}
                        label="Require Multiple Messages"
                    />

                    {filters.requireMultipleMessages && (
                        <>
                            <div className="ml-6">
                                <label>Minimum Messages Required</label>
                                <NumberField
                                    value={filters.minRequiredMessages}
                                    onChange={value => setFilters(prev => ({
                                        ...prev,
                                        minRequiredMessages: value
                                    }))}
                                    min={2}
                                    step={1}
                                />
                            </div>
                            <span className="text-xs text-gray-600">
                                Number of messages required before taking action
                            </span>
                        </>
                    )}
                </div>
            </Fieldset>
        </div>
    );

    return (
        <Modal
            title="Enhanced Filter Configuration"
            isOpen={isOpen}
            onClose={onClose}
            className="bg-white"
            style={{ backgroundColor: 'rgba(255, 255, 255, 1)', zIndex: 100000, width: '80%' }}
        >
            <Window className="w-full">
                <WindowHeader>Configure Trading Bot Filters</WindowHeader>
                <WindowContent>
                    <Tabs value={activeTab} onChange={setActiveTab}>
                        <Tab value={0} >Basic</Tab>
                        <Tab value={1}>Developer</Tab>
                        <Tab value={2}>Social</Tab>
                        <Tab value={3} style={{ width: '8rem' }}>Copy Trade</Tab>
                        <Tab value={4}>Metadata</Tab>
                        <Tab value={5}>Volume</Tab>
                        <Tab value={6}>Bonding</Tab>
                        <Tab value={7}>AFK</Tab>
                        <Tab value={8}>Telegram</Tab>
                        <Tab value={9}>Other</Tab>
                    </Tabs>

                    <TabBody className="p-4">
                        {activeTab === 0 && renderBasicTab()}
                        {activeTab === 1 && renderDeveloperTab()}
                        {activeTab === 2 && renderSocialTab()}
                        {activeTab === 3 && renderCopyTradeTab()}
                        {activeTab === 4 && renderMetadataTab()}
                        {activeTab === 5 && renderVolumeTab()}
                        {activeTab === 6 && renderBondingTab()}
                        {activeTab === 7 && renderAfkTab()}
                        {activeTab === 8 && renderTelegramTab()}
                        {activeTab === 9 && renderOtherTab()}
                    </TabBody>

                    <div className="flex justify-end gap-2 mt-4 p-4 border-t border-gray-200">
                        <Button onClick={() => {
                            handleSave();
                            onClose();
                        }}>
                            Save Changes
                        </Button>
                        <Button onClick={onClose} variant="default">
                            Cancel
                        </Button>
                    </div>
                </WindowContent>
            </Window>
        </Modal>)
}


const FilterConfigButton = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>
                Configure Filters
            </Button>
            <FilterConfigModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
};

export default SniperWindow;