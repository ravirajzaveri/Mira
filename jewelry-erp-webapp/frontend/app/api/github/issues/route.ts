import { NextRequest, NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'ravirajzaveri/Mira';

export async function POST(request: NextRequest) {
  try {
    const { title, body, labels, priority } = await request.json();

    if (!GITHUB_TOKEN) {
      return NextResponse.json(
        { error: 'GitHub token not configured' },
        { status: 500 }
      );
    }

    // Create GitHub issue
    const githubResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/issues`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body,
          labels: labels || ['voice-report'],
        }),
      }
    );

    if (!githubResponse.ok) {
      const errorData = await githubResponse.json();
      console.error('GitHub API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create GitHub issue', details: errorData },
        { status: githubResponse.status }
      );
    }

    const issue = await githubResponse.json();

    // Add priority label if specified
    if (priority && priority !== 'medium') {
      await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/issues/${issue.number}/labels`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            labels: [`priority:${priority}`]
          }),
        }
      );
    }

    return NextResponse.json({
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
      created_at: issue.created_at,
    });

  } catch (error) {
    console.error('Error creating GitHub issue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const state = url.searchParams.get('state') || 'open';
    const labels = url.searchParams.get('labels');

    if (!GITHUB_TOKEN) {
      return NextResponse.json(
        { error: 'GitHub token not configured' },
        { status: 500 }
      );
    }

    let apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/issues?state=${state}`;
    if (labels) {
      apiUrl += `&labels=${labels}`;
    }

    const githubResponse = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!githubResponse.ok) {
      const errorData = await githubResponse.json();
      return NextResponse.json(
        { error: 'Failed to fetch GitHub issues', details: errorData },
        { status: githubResponse.status }
      );
    }

    const issues = await githubResponse.json();
    
    return NextResponse.json(
      issues.map((issue: any) => ({
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        labels: issue.labels.map((label: any) => label.name),
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        url: issue.html_url,
      }))
    );

  } catch (error) {
    console.error('Error fetching GitHub issues:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}