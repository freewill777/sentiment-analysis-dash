import React, { useState, useContext, useEffect } from 'react'
import Explorer from './Explorer'
import Notepad from './Notepad';
import DataContext from '../contexts/dataContext'
import Shortcuts from './Shortcuts';
import Player from './Player';
import SentimentAnalysis from './SentimentAnalysis';
import Taskbar from './Taskbar';
import SniperWindow from './SniperWindow';

function Desktop() {

    const isMobile = window.innerWidth < 850;

    const data = useContext(DataContext);
    const [explorerOpened, toggleExplorer] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [notepadOpened, toggleNotepad] = useState(false);
    const [sentimentAnalysisOpened, toggleSentimentAnalysis] = useState(false);
    const [sniperOpened, toggleSniper] = useState(false);

    const [items, setItems] = useState([]);

    useEffect(
        () => {
            const files = data.getItems();
            setItems(files);
            setSelectedItem(files[0]);
        }, [data, isMobile]);


    const closeExplorer = () => {
        toggleExplorer(false);
    };

    const openExlorer = () => {
        toggleExplorer(true);
    };

    const closeNotepad = () => {
        toggleNotepad(false);
    };

    const openNotepad = (item) => {
        setSelectedItem(item)
        toggleNotepad(true);
    };

    const openSentimentAnalysis = () => {
        closeSniper();
        toggleSentimentAnalysis(true);
    }

    const closeSentimentAnalysis = () => {
        toggleSentimentAnalysis(false);
    }

    const openSniper = () => {
        closeSentimentAnalysis();
        toggleSniper(true);
    }

    const closeSniper = () => {
        toggleSniper(false);
    }

    return (
        <React.Fragment>
            <Shortcuts openExplorer={openExlorer} openSentimentAnalysis={openSentimentAnalysis} />
            {
                explorerOpened && (
                    <Explorer items={items} closeExplorer={closeExplorer} openNotepad={openNotepad} isMobile={isMobile} />
                )
            }
            {
                notepadOpened && (
                    <Notepad closeNotepad={closeNotepad} selectedItem={selectedItem} isMobile={isMobile} />
                )
            }
            {
                sentimentAnalysisOpened && (
                    <SentimentAnalysis closeSentimentAnalysis={closeSentimentAnalysis} isMobile={isMobile} />
                )
            }
            {
                sniperOpened && (
                    <SniperWindow closeSentimentAnalysis={closeSentimentAnalysis} isMobile={isMobile} />
                )
            }
            <Player />
            <Taskbar openSentimentAnalysis={openSentimentAnalysis} closeSentimentAnalysis={closeSentimentAnalysis} openSniper={openSniper} closeSniper={closeSniper} />
        </React.Fragment>
    )
}

export default Desktop
