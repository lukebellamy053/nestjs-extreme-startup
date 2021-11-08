import React, {useEffect} from "react";
import {Box, Button, Grid, Typography} from "@mui/material";
import {GetServerSideProps} from "next";
import axios from "axios";
import {getPlayers, getRound, getScores} from "../../../server/Player";
import {useRouter} from "next/router";
import CurrentScoreBarChart from "../../../components/CurrentScoreBarChart";
import {ScoreHistory} from "../../../components/ScoreHistory";

export const RunServerPage = ({players, round, scores}) => {

    const router = useRouter();

    const stopServer = () => {
        axios.delete('/api/server').then(() => reloadPage())
    }

    const reloadPage = () => router.replace(router.asPath);

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace(router.asPath);
        }, 2000);
        return () => clearTimeout(timer);
    })

    return <>
        <Typography variant="h4">Running Server</Typography>
        <Typography variant="body1" color="text.secondary">The game has begun</Typography>
        <Box mt={2}>
            <Button onClick={() => stopServer()}>Stop</Button>
        </Box>
        <Box mt={2}>
            <Typography variant="h6">Players - {players.length}</Typography>
        </Box>
        <Box mt={2}>
            <Typography variant="h6">Round - {round}</Typography>
        </Box>
        <Box mt={2}>
            <Typography variant="h6">Top Scorers</Typography>
        </Box>
        <Grid container>
            <Grid item sm={12} lg={4}>
                <Box mt={2} height={400}>
                    <CurrentScoreBarChart players={players}/>
                </Box>
            </Grid>
            <Grid item sm={12} lg={8}>
                <Box mt={2} height={400}>
                    {scores && <ScoreHistory scores={scores}/>}
                </Box>
            </Grid>
        </Grid>
    </>
}

// @ts-ignore - used by nextjs
export const getServerSideProps: GetServerSideProps = async (context) => {
    const round = await getRound();
    if (round == null) {
        return {
            redirect: {
                destination: '/server'
            }
        }
    }
    return {
        props: {
            players: await getPlayers(),
            round: round,
            scores: await getScores()
        },
    }
}

export default RunServerPage;
