import React, { useState, useContext, useEffect } from 'react'
import Explorer from './Explorer'
import Notepad from './Notepad';
import DataContext from '../contexts/dataContext'
import Shortcuts from './Shortcuts';
import Player from './Player';
import SentimentAnalysis from './SentimentAnalysis';
import Taskbar from './Taskbar';
function Desktop() {

    const isMobile = window.innerWidth < 850;

    const data = useContext(DataContext);
    const [explorerOpened, toggleExplorer] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [notepadOpened, toggleNotepad] = useState(false);
    const [sentimentAnalysisOpened, toggleSentimentAnalysis] = useState(false);

    const [items, setItems] = useState([]);

    useEffect(
        () => {
            const files = data.getItems();
            setItems(files);
            toggleSentimentAnalysis(true);
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
        toggleSentimentAnalysis(true);
    }

    const closeSentimentAnalysis = () => {
        toggleSentimentAnalysis(false);
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
            <Player />
            <Taskbar openSentimentAnalysis={openSentimentAnalysis} closeSentimentAnalysis={closeSentimentAnalysis} />
        </React.Fragment>
    )
}

export default Desktop
