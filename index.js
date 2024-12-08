import express from 'express';
import exphbs from 'express-handlebars';
import { request, gql } from 'graphql-request';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

const fetchProjects = async (organization) => {
    const endpoint = 'https://api.github.com/graphql';
    const token = process.env.GITHUB_TOKEN;

    const query = gql`
        query ($org: String!) {
            organization(login: $org) {
                projectsV2(first: 10) {
                    nodes {
                        title
                        url
                        createdAt
                        updatedAt
                    }
                }
            }
        }
    `;

    const variables = { org: organization };
    const headers = {
        Authorization: `Bearer ${token}`,
    };

    try {
        const data = await request(endpoint, query, variables, headers);
        return data.organization.projectsV2.nodes;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
};

app.get('/progress', async (req, res) => {
    const organization = 'RetendoNetwork';
    const projects = await fetchProjects(organization);

    res.render('progress', { projects });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});