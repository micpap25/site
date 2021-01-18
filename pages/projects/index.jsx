import Page from 'components/Page';
import { stringify } from 'querystring';
import { Pagination, Row, Badge } from 'react-bootstrap';
import styled from 'styled-components';
import Link from 'next/link';
import { BlogPaginationItem, CustomPagination } from '../blog/index';
import { ErrorComponent } from '../_error';
import ProjectButton from 'components/ProjectButton';
import { decode } from 'he';

function urlForPage(page) {
    if (page === 1) {
        return "/projects";
    } else {
        return `?page=${page}`;
    }
}

const Project = styled.a`
    display: block;
    background-color: ${props => props.theme.colors.cardBackground};
    color: ${props => props.theme.colors.text};
    height: 100%;
    padding-bottom: 4.75rem;

    &:hover, &:active {
        text-decoration: none;
        color: ${props => props.theme.colors.text};
    }
`;

const ProjectButtonContainer = styled.div`
    position: absolute;
    left: ${props => props.theme.spacing.lg};
    bottom: ${props => props.theme.spacing.lg};
`;

export default function Portfolio({projects, page, errorCode, totalPages}) {
    if (errorCode) return <ErrorComponent statusCode={errorCode} />;
    
    return <Page title="Portfolio" logoAccent="portfolioAccent">
        <h1>Portfolio</h1>
        <p className="lead mb-5">I've made many things. Here are some of them.</p>

        <Row className="pl-3">
            {projects.map(project => {
                return <div className="col-12 col-md-6 mb-3 position-relative pl-0" key={project.slug}>
                    <Link href="/projects/[slug]" as={`/projects/${project.slug}`} passHref>
                        <Project className="shadow rounded px-4 pt-4">
                            <h2>{project.title}</h2>
                            {project.technologies.length > 0 && <p>{project.technologies.map(({ id, name }) =>
                                <Badge variant="dark" key={id} className="mr-1">{decode(name)}</Badge>
                            )}</p>}
                            <p>{project.shortDescription}</p>
                        </Project>
                    </Link>
                    {project.url && <ProjectButtonContainer>
                        <ProjectButton project={project} />
                    </ProjectButtonContainer>}
                </div>;
            })}
        </Row>

        {totalPages > 1 && <CustomPagination>
            {page > 1 ? <Link href={urlForPage(page - 1)} passHref><Pagination.Prev /></Link> : <Pagination.Prev disabled />}
            <BlogPaginationItem page={1} currentPage={page} />
            {page > 3 && <Pagination.Ellipses disabled />}
            {range(Math.max(2, page - 2), Math.min(page + 3, totalPages)).map(destination => <BlogPaginationItem key={destination} page={destination} currentPage={page} />)}
            {page < totalPages - 2 && <Pagination.Ellipses disabled />}
            <BlogPaginationItem page={totalPages} currentPage={page} />
            {page < totalPages ? <Link href={urlForPage(page + 1)} passHref><Pagination.Next /></Link> : <Pagination.Next disabled />}
        </CustomPagination>}
    </Page>
}

export async function getServerSideProps(ctx) {
    const perPage = 20;
    const page = (ctx.query && ctx.query.page && parseInt(ctx.query.page)) || 1;
    if (Number.isNaN(ctx.query.page) || page < 0) {
        return {
            props: {
                errorCode: 400
            }
        };
    }

    const query = {
        _fields: "slug,title,short_description,project_url,project_domain,brand_bg,brand_fg,technologies",
        per_page: perPage,
        page
    };

    const url = "https://wp.anli.dev/wp-json/wp/v2/project?" + stringify(query);
    const response = await fetch(url);
    const technologiesPromise = fetch("https://wp.anli.dev/wp-json/wp/v2/technologies?_fields=id,name").then(res => res.json());
    const total = parseInt(response.headers.get("x-wp-total"));
    const totalPages = parseInt(response.headers.get("x-wp-totalpages"));
    const data = await response.json();
    
    const technologies = new Map();
    const technologiesResponse = await technologiesPromise;
    if (technologiesResponse.forEach) {
        technologiesResponse.forEach((tech) => {
            technologies.set(tech.id, tech);
        });
    }

    if (!data.map) { // TODO: Actually consider type
        return {
            props: {
                errorCode: 502
            }
        };
    }

    const props = {
        projects: data.map(postData => ({
            slug: postData.slug,
            title: postData.title.rendered,
            shortDescription: postData.short_description || null,
            url: postData.project_url || null,
            domain: postData.project_domain || null,
            brand: {
                bg: postData.brand_bg || null,
                fg: postData.brand_fg || null
            },
            technologies: (postData.technologies || []).map(id => technologies.get(id)).filter(tech => tech)
        })),
        perPage,
        page
    };

    if (!Number.isNaN(total)) {
        props.total = total;
    }

    if (!Number.isNaN(totalPages)) {
        props.totalPages = totalPages;
    }

    return {props};
}