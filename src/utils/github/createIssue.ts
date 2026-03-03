import { GITHUB_API } from '#constants'
import config from '#config'

interface CreateIssueParams {
    repositoryId: string
    title: string
    body: string
    projectIds?: string[]
}

export default async function createIssue(params: CreateIssueParams): Promise<
  { id: string, number: number, url: string, projectItemId?: string } | null
> {
    const mutation = `
        mutation($input: CreateIssueInput!) {
            createIssue(input: $input) {
                issue {
                    id
                    number
                    url
                    projectItems(first: 10) {
                        nodes {
                            id
                            project {
                                id
                            }
                        }
                    }
                }
            }
        }
    `

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const variables: any = {
            input: {
                repositoryId: params.repositoryId,
                title: params.title,
                body: params.body
            }
        }

        if (params.projectIds && params.projectIds.length > 0) {
            variables.input.projectIds = params.projectIds
        }

        const response = await fetch(`${GITHUB_API}graphql`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.githubToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: mutation,
                variables
            })
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        if (data.errors) {
            throw new Error(JSON.stringify(data.errors))
        }

        const issue = data.data.createIssue.issue
        let projectItemId: string | undefined

        if (params.projectIds && params.projectIds.length > 0) {
            const targetProjectId = params.projectIds[0]
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const item = issue.projectItems.nodes.find((node: any) => node.project.id === targetProjectId)
            if (item) {
                projectItemId = item.id
            }
        }

        return {
            id: issue.id,
            number: issue.number,
            url: issue.url,
            projectItemId
        }
    } catch (error) {
        console.error('Failed to create issue via GraphQL:', error)
        throw error
    }
}
