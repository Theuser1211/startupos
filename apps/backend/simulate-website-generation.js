import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    // Create a startup
    const startup = await prisma.startup.create({
      data: {
        name: 'AI Lawyer',
        description: 'AI-powered legal assistant for startups',
        industry: 'Legal Tech',
        userId: 'user-123'
      }
    });
    console.log('Startup created:', startup.id);

    // Create a blueprint
    const blueprint = await prisma.blueprint.create({
      data: {
        startupId: startup.id,
        content: {
          sections: [
            {
              title: 'Home',
              content: 'Welcome to AI Lawyer - Your AI-powered legal assistant for startups'
            },
            {
              title: 'Services',
              content: 'AI contract review, legal document analysis, compliance monitoring'
            },
            {
              title: 'About',
              content: 'We provide AI-powered legal services specifically designed for startups'
            }
          ]
        }
      }
    });
    console.log('Blueprint created:', blueprint.id);

    // Create a job for website generation
    const job = await prisma.job.create({
      data: {
        type: 'WEBSITE_GENERATION',
        status: 'PENDING',
        payload: {
          startupId: startup.id,
          blueprintId: blueprint.id,
          startupName: startup.name
        },
        startupId: startup.id
      }
    });
    console.log('Job created:', job.id);

    // Simulate the website generation process
    await prisma.job.update({
      where: { id: job.id },
      data: { status: 'PROCESSING' }
    });

    // Generate website spec
    const websiteSpec = {
      name: startup.name,
      sections: [
        {
          id: 'hero',
          title: 'AI Lawyer',
          content: 'Your AI-powered legal assistant for startups',
          type: 'hero'
        },
        {
          id: 'services',
          title: 'Our Services',
          content: 'AI contract review, legal document analysis, compliance monitoring',
          type: 'services'
        },
        {
          id: 'features',
          title: 'Key Features',
          content: '24/7 AI legal assistance, instant document analysis, compliance tracking',
          type: 'features'
        },
        {
          id: 'about',
          title: 'About AI Lawyer',
          content: 'We provide AI-powered legal services specifically designed for startups',
          type: 'about'
        }
      ]
    };

    // Create website with spec
    const website = await prisma.website.create({
      data: {
        name: startup.name,
        content: {},
        status: 'spec_generated',
        startupId: startup.id,
        spec: {
          create: {
            content: websiteSpec
          }
        }
      }
    });
    console.log('Website created:', website.id);

    // Update job to completed
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: 'COMPLETED',
        result: { websiteId: website.id }
      }
    });

    console.log('Website generation completed successfully!');
    console.log('Website ID:', website.id);
    console.log('Website Spec:', JSON.stringify(websiteSpec, null, 2));

    // Return the data for the deliverables
    return {
      startupId: startup.id,
      blueprintId: blueprint.id,
      jobId: job.id,
      websiteId: website.id,
      websiteSpec,
      requestPayload: {
        startupId: startup.id
      },
      responseBody: {
        jobId: job.id,
        status: 'PENDING'
      }
    };

  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().then(result => {
  console.log('\n=== DELIVERABLES ===');
  console.log('Request Payload:', JSON.stringify(result.requestPayload, null, 2));
  console.log('Response Body:', JSON.stringify(result.responseBody, null, 2));
  console.log('Website Spec:', JSON.stringify(result.websiteSpec, null, 2));
  console.log('Website JSON: Not yet generated (content field is empty)');
}).catch(console.error);