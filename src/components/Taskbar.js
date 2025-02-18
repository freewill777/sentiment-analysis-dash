import React, { useContext } from 'react'
import DataContext from '../contexts/dataContext'
import { TaskBar, List } from '@react95/core'
import styled from 'styled-components'

const Link = styled.a`
    text-decoration: none;
    color: inherit;
`


function Taskbar({ openSentimentAnalysis, openSniper }) {
    const { projectRepo, react95Repo } = useContext(DataContext).getProjectInfo();
    console.log(projectRepo, react95Repo)
    console.log('==========',useContext(DataContext).sloboz())
    
    return (
        <TaskBar
            list={
                <List>
                    <List.Item className="pointer" icon="explore" onClick={openSniper}>
                        <Link className="pointer" target="_blank">Sniper</Link>
                    </List.Item>
                    <List.Item className="pointer" icon="drvspace_7" onClick={openSentimentAnalysis}>
                        <Link className="pointer" target="_blank">Telegram TrendSense</Link>
                    </List.Item>
                    <List.Item className="pointer" icon="inetcpl_1321" onClick={undefined}>
                        <Link className="pointer" target="_blank">Profitable wallets</Link>
                    </List.Item>
                    <List.Divider />
                    <List.Item className="pointer" icon="folder_file" onClick={() => window.open('about')}>
                        <Link target="_blank" className="pointer">Contact</Link>
                    </List.Item>
                </List>
            }
        />
    )
}

export default Taskbar
