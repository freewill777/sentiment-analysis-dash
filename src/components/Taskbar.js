import React, { useContext } from 'react'
import DataContext from '../contexts/dataContext'
import { TaskBar, List } from '@react95/core'
import styled from 'styled-components'

const Link = styled.a`
    text-decoration: none;
    color: inherit;
`


function Taskbar({closeSentimentAnalysis, openSentimentAnalysis}) {
    const { projectRepo, react95Repo } = useContext(DataContext).getProjectInfo();
    console.log(projectRepo, react95Repo)
    return (
        <TaskBar
            list={
                <List>
                    <List.Item className="pointer" icon="drvspace_7">
                        <Link onClick={openSentimentAnalysis} target="_blank">Telegram TrendSense</Link>
                    </List.Item>
                    <List.Divider />
                    <List.Item className="pointer" icon="folder_file">
                        <Link href={projectRepo} target="_blank">Contact</Link>
                    </List.Item>
                </List>
            }
        />
    )
}

export default Taskbar
