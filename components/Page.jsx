import { Container } from "react-bootstrap";
import Navigation from "./Navigation";
import Footer from "./Footer";
import { Fragment } from "react";
import styled from "styled-components";
import { transparentize } from "polished";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";

const CustomContainer = styled(Container)`
    margin-top: 128px;
`;

const NavigationBox = styled.div`
    height: 88px;
    padding: 16px 0;
    z-index: 101;
`;

const GradientBox = styled(NavigationBox)`
    background-image: linear-gradient(to bottom, ${props => props.theme.colors.light.primaryBackground} 18%, ${props => transparentize(0.7, props.theme.colors.light.primaryBackground)} 70%, ${props => transparentize(1, props.theme.colors.light.primaryBackground)});
    pointer-events: none;
    z-index: 100;

    @media (prefers-color-scheme: dark) {
        background-image: linear-gradient(to bottom, ${props => props.theme.colors.dark.primaryBackground} 18%, ${props => transparentize(0.7, props.theme.colors.dark.primaryBackground)} 70%, ${props => transparentize(1, props.theme.colors.dark.primaryBackground)});
    }
`;

export default function Page({children, title, logoAccent, openGraph, noindex}) {
    const router = useRouter();

    return <Fragment>
        <NextSeo title={title && `${title} - Anthony Li (anli5005)`} openGraph={{
            title,
            url: "https://anli.dev" + (router.asPath || ""),
            ...openGraph
        }} noindex={noindex} />
        <GradientBox className="fixed-top" />
        <NavigationBox className="fixed-top">
            <Container className="px-3">
                <Navigation accent={logoAccent} />
            </Container>
        </NavigationBox>
        <CustomContainer className="px-3 mb-5">
            {children}
        </CustomContainer>
        <Footer />
    </Fragment>
};
