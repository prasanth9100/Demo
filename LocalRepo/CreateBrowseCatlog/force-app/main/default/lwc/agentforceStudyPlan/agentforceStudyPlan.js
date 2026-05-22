import { LightningElement, track } from 'lwc';

const DAYS_DATA = [
    {
        num: 1,
        title: 'Foundations of Agentforce & AI Concepts',
        subtitle: 'Understand what Agentforce is, the Third Wave of AI, Einstein Trust Layer, and autonomous agent architecture',
        time: '4h',
        examWeight: null,
        color: '#7F77DD',
        bgColor: '#EEEDFE',
        topics: [
            {
                text: 'What is Agentforce?',
                sub: 'Third Wave of AI, copilots vs. autonomous agents, digital labor platform',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_intro.htm',
                details: [
                    {
                        heading: 'Overview',
                        text: 'Agentforce is Salesforce\'s autonomous AI platform representing the Third Wave of AI — going beyond copilots (AI that assists humans) to fully autonomous agents that take action on their own. It is described as a digital labor platform that deploys AI agents to handle work across sales, service, marketing, and commerce without constant human input.'
                    },
                    {
                        heading: 'Key Concepts',
                        text: 'First Wave: Rule-based AI (Einstein Predictions). Second Wave: Copilots (Einstein Copilot, suggesting next steps). Third Wave: Autonomous Agents — Agentforce agents independently plan, reason, and take multi-step actions based on goals. They use natural language understanding and the Atlas Reasoning Engine to decide what to do next.'
                    },
                    {
                        heading: 'Why It Matters',
                        text: 'Agentforce enables companies to scale operations without scaling headcount. Agents handle repetitive, multi-step tasks 24/7, freeing human workers for complex, high-value interactions. This is the core business case that appears in the Agentforce Specialist exam.'
                    }
                ]
            },
            {
                text: 'Einstein Trust Layer',
                sub: 'Data masking, zero data retention, toxicity detection, audit trails',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.einstein_trust_layer.htm',
                details: [
                    {
                        heading: 'What It Is',
                        text: 'The Einstein Trust Layer is the security and compliance foundation for all AI features in Salesforce. Every LLM call from Agentforce goes through this layer before reaching any external model (like OpenAI or Anthropic). It ensures no customer data is stored by third-party LLM providers.'
                    },
                    {
                        heading: 'Key Features',
                        text: 'Dynamic Grounding: Augments prompts with relevant CRM data. Data Masking: PII and sensitive data is masked before leaving Salesforce. Zero Data Retention: Salesforce contractually ensures LLM providers do not retain your data. Toxicity Detection: Filters harmful outputs before they reach users. Audit Trail: Logs all AI interactions for compliance review in the Einstein Activity Audit.'
                    },
                    {
                        heading: 'Exam Tip',
                        text: 'The Trust Layer is always between Salesforce and the LLM — you cannot bypass it. Data masking and zero data retention are the two most-tested aspects. Know that enabling Einstein (not Data 360) is sufficient to activate the Trust Layer.'
                    }
                ]
            },
            {
                text: 'Atlas Reasoning Engine',
                sub: 'How agents plan, reason, and take autonomous actions in loops',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_reasoning.htm',
                details: [
                    {
                        heading: 'How It Works',
                        text: 'The Atlas Reasoning Engine is the brain of every Agentforce agent. When a user sends a message, Atlas interprets the intent, matches it to a configured Topic, selects the appropriate Action, executes it, evaluates the result, and decides whether to continue or respond. This plan-act-observe loop repeats until the task is complete or needs escalation.'
                    },
                    {
                        heading: 'Reasoning Loop Steps',
                        text: '1. Understand intent from user input. 2. Match to a relevant Topic. 3. Select the best Action for the topic. 4. Execute the action (Flow, Apex, API call). 5. Evaluate output. 6. Formulate natural language response. 7. Decide: respond to user, ask for clarification, or escalate.'
                    },
                    {
                        heading: 'Determinism',
                        text: 'By default Atlas uses generative AI reasoning which is non-deterministic (results may vary). You can add deterministic behavior using topic filters and variables to enforce specific logic paths. This is important for regulated industries or high-stakes actions like financial transactions.'
                    }
                ]
            },
            {
                text: 'Agent Types Overview',
                sub: 'Service Agent, Sales Agent, Employee Agent — when to use each',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_agent_types.htm',
                details: [
                    {
                        heading: 'Service Agent',
                        text: 'Deployed on external customer-facing channels (Experience Cloud, web chat, SMS, WhatsApp). Handles case deflection, order inquiries, returns, knowledge article lookup. Escalates to human agents when needed. Uses the Einstein Agent User profile. Most common type in the exam scenarios.'
                    },
                    {
                        heading: 'Sales Agent (SDR)',
                        text: 'Handles inbound and outbound prospect engagement. Can qualify leads, send personalized emails via Einstein for Sales, schedule meetings, and handle objections. Works within Sales Cloud and CRM data. Primarily used by sales teams to scale top-of-funnel activities.'
                    },
                    {
                        heading: 'Employee Agent',
                        text: 'Internal-facing agent for employee support (HR queries, IT tickets, policy questions, onboarding). Deployed via Slack or internal portals. Uses internal knowledge bases and connected flows to resolve employee requests without IT helpdesk involvement. Particularly powerful for large enterprise organizations.'
                    }
                ]
            }
        ],
        usecase: {
            text: 'Sign up for a free Agentforce Developer org and explore the pre-built agent templates.',
            steps: [
                'Go to developer.salesforce.com and sign up for the Agentforce Developer Edition org',
                'Navigate to Setup → Agentforce Agents and browse all available templates',
                'Open one template in Agent Builder and document its Topics, Actions, and Channel',
                'Navigate to Setup → Einstein → Einstein Trust Layer and review the audit log settings'
            ]
        },
        trailheads: [
            {
                name: 'Introduction to Agentforce',
                type: 'Module',
                url: 'https://trailhead.salesforce.com/content/learn/modules/introduction-to-agentforce',
                icon: 'utility:education'
            },
            {
                name: 'Get Ready for Agentforce',
                type: 'Trail',
                url: 'https://trailhead.salesforce.com/content/learn/trails/get-ready-for-agentforce',
                icon: 'utility:trail'
            },
            {
                name: 'Einstein Trust Layer',
                type: 'Module',
                url: 'https://trailhead.salesforce.com/content/learn/modules/einstein-trust-layer',
                icon: 'utility:shield'
            }
        ]
    },
    {
        num: 2,
        title: 'Prompt Engineering (30% of Exam)',
        subtitle: 'Master prompt design, grounding techniques, Prompt Builder configuration, and template types',
        time: '4h',
        examWeight: '30%',
        color: '#BA7517',
        bgColor: '#FAEEDA',
        topics: [
            {
                text: 'Prompt Engineering Principles',
                sub: 'Zero-shot, few-shot, chain-of-thought, instructional prompting',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.prompt_builder_prompt_engineering.htm',
                details: [
                    {
                        heading: 'Core Techniques',
                        text: 'Zero-shot: Give the model instructions without examples — simplest but less reliable for complex tasks. Few-shot: Provide 2–5 examples of desired input-output pairs — significantly improves consistency. Chain-of-thought: Ask the model to "think step by step" before answering — improves reasoning on complex questions. These techniques directly appear in the Agentforce Specialist exam (30% weight).'
                    },
                    {
                        heading: 'Prompt Structure Best Practices',
                        text: 'Good prompts include: a clear role/persona ("You are a Salesforce service agent..."), a specific task description, context/grounding data (merge fields, CRM data), output format requirements (JSON, bullet points, specific length), and tone/style instructions. Ambiguous prompts lead to inconsistent agent responses.'
                    },
                    {
                        heading: 'Hallucination Prevention',
                        text: 'Instruct the model to say "I don\'t know" when uncertain rather than guessing. Add: "Only use the information provided in the context. Do not make up information." Ground prompts with actual CRM data via merge fields to give the model accurate information to work from.'
                    }
                ]
            },
            {
                text: 'Prompt Builder',
                sub: 'Field generation, record summary, flex templates — build and manage prompt templates',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.prompt_builder_overview.htm',
                details: [
                    {
                        heading: 'What Is Prompt Builder?',
                        text: 'Prompt Builder is the Salesforce declarative tool for creating, managing, and deploying prompt templates. It is accessible from Setup → Prompt Builder. Admins create templates without code; developers can extend them via Apex. Templates are versioned and can be associated with specific objects, user roles, and Agentforce actions.'
                    },
                    {
                        heading: 'Template Types',
                        text: 'Field Generation: Populates a single record field (e.g., auto-generate a case summary in a text field on the Case record). Record Summary: Generates a text summary based on a record and its related data (e.g., summarize a contact\'s recent activity). Flex: Most flexible — used in Agentforce agent actions. Takes dynamic input at runtime and is not tied to a specific record type or field.'
                    },
                    {
                        heading: 'User Roles',
                        text: 'Prompt Template Manager: Create, edit, and manage prompt templates. Prompt Template User: Execute prompt templates (used by agents and flows). These permission sets are separate from standard Salesforce profiles — always verify user has the correct role when troubleshooting prompt access issues.'
                    }
                ]
            },
            {
                text: 'Grounding Techniques',
                sub: 'RAG, merge fields, static text — how to give agents accurate context',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_grounding.htm',
                details: [
                    {
                        heading: 'What is Grounding?',
                        text: 'Grounding means injecting relevant, factual data into a prompt so the AI model responds based on your actual business data rather than its generic training. Ungrounded prompts rely on the LLM\'s generic knowledge, which can lead to inaccurate or irrelevant responses for your specific use case.'
                    },
                    {
                        heading: 'Grounding Methods',
                        text: 'Merge Fields: Insert specific field values from CRM records (e.g., {!Case.Subject}, {!Account.Name}). Simple and low-latency. Static Text: Hardcode company policies, product info, or rules directly in the prompt template. RAG (Retrieval Augmented Generation): Dynamically retrieve chunks of relevant documents/knowledge at runtime from Agentforce Data Library. Most powerful but requires Data 360.'
                    },
                    {
                        heading: 'When to Use Which',
                        text: 'Merge fields: when the data is a specific field value on a known record. Static text: for policies, instructions, or rules that rarely change. RAG: when the knowledge base is large, changes frequently, or contains unstructured documents (PDFs, articles, FAQ docs). RAG is the most exam-tested grounding technique alongside Data 360.'
                    }
                ]
            },
            {
                text: 'Testing & Refining Prompts',
                sub: 'Preview panel, iterative testing, evaluating prompt output quality',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.prompt_builder_testing.htm',
                details: [
                    {
                        heading: 'Testing in Prompt Builder',
                        text: 'Prompt Builder includes a Preview panel where you can select a record and see the generated output in real time. Always test with multiple records (edge cases, missing fields, multilingual inputs) before deploying to an agent. Look for hallucinations, overly long responses, tone issues, and incorrect data surfacing.'
                    },
                    {
                        heading: 'Iteration Cycle',
                        text: 'Write prompt → Preview with sample records → Identify issues (hallucination, format, length) → Add constraints or examples → Re-test → When stable, save a new version and associate with the agent action. Never modify a live template version — create new versions to maintain audit history.'
                    },
                    {
                        heading: 'Common Issues',
                        text: 'Too verbose: Add "Respond in 2-3 sentences maximum." Off-topic: Add "Only answer questions about [topic]." Wrong format: Add explicit format instructions with an example. Missing fields causing errors: Add null-checks like "If {!Case.Description} is blank, state that no description is available."'
                    }
                ]
            }
        ],
        usecase: {
            text: 'Build a working Case Summary prompt template in Prompt Builder.',
            steps: [
                'Go to Setup → Prompt Builder → New Prompt Template → choose Record Summary',
                'Select the Case object; add merge fields for Subject, Description, and Account.Name',
                'Write a system instruction: "You are a Salesforce service agent. Summarize this case in 3 sentences."',
                'Test with 5 different Case records; refine for consistency',
                'Save the template and note the API name — you will use this in Day 3 when building an agent action'
            ]
        },
        trailheads: [
            {
                name: 'Prompt Engineering Basics',
                type: 'Module',
                url: 'https://trailhead.salesforce.com/content/learn/modules/large-language-models',
                icon: 'utility:education'
            },
            {
                name: 'Build Prompts with Prompt Builder',
                type: 'Module',
                url: 'https://trailhead.salesforce.com/content/learn/modules/prompt-builder',
                icon: 'utility:edit'
            },
            {
                name: 'Cert Prep: Prompt Engineering Unit',
                type: 'Module',
                url: 'https://trailhead.salesforce.com/content/learn/modules/cert-prep-agentforce-specialist/review-prompt-engineering-for-agentforce',
                icon: 'utility:check'
            }
        ]
    },
    {
        num: 3,
        title: 'Agentforce Concepts & Architecture (30% of Exam)',
        subtitle: 'Deep-dive into topics, actions, agent types, channels, and the reasoning engine configuration',
        time: '4h',
        examWeight: '30%',
        color: '#534AB7',
        bgColor: '#EEEDFE',
        topics: [
            {
                text: 'Topics & Actions',
                sub: 'Standard vs. custom topics, action types, topic instructions and scope',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_topics_actions.htm',
                details: [
                    {
                        heading: 'Topics',
                        text: 'A Topic is a cluster of related intents that the agent can handle. Each topic has: a Name, a Description (used by the reasoning engine to match user intent — write this very carefully), Instructions (step-by-step guidance for the agent within that topic), and associated Actions. Standard topics come pre-built (General FAQ, Escalation). Custom topics are created for specific business needs.'
                    },
                    {
                        heading: 'Actions',
                        text: 'Actions are the "tools" an agent uses within a topic. Types: Standard Actions (pre-built by Salesforce, e.g., Query Records, Create Record, Send Email). Flow Actions (trigger an autolaunched Flow). Apex Actions (call an @InvocableMethod). Prompt Actions (run a Prompt Builder template). API Actions (call an external API). Each action has instructions that tell the agent when and how to use it.'
                    },
                    {
                        heading: 'Critical Exam Point',
                        text: 'Topic descriptions are used by Atlas to decide which topic to activate — they are the most critical configuration field. If two topics have overlapping descriptions, the agent will pick the wrong one. Always write unique, specific descriptions. The Escalation topic is a best practice — always include it so the agent can hand off to a human when it cannot resolve an issue.'
                    }
                ]
            },
            {
                text: 'Agent Builder Configuration',
                sub: 'Company context, system prompts, agent instructions, activation steps',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_builder.htm',
                details: [
                    {
                        heading: 'Agent Builder Overview',
                        text: 'Agent Builder is the declarative setup interface for Agentforce, accessed via Setup → Agentforce Agents → Open in Builder. It has four panels: Agent Details (name, description, company context), Topics (add/remove topics), Preview (test the agent in real time), and Channels (where the agent is deployed).'
                    },
                    {
                        heading: 'Company Context',
                        text: 'The Company Context (also called the agent\'s system prompt) is a global instruction set that applies to every conversation — your company name, brand voice, what the agent can and cannot discuss, escalation rules, and language preferences. This is the highest-level configuration and overrides individual topic instructions in case of conflict.'
                    },
                    {
                        heading: 'Activation',
                        text: 'Steps to activate an agent: (1) Complete all required configuration fields. (2) Ensure the Einstein Agent User profile is configured (Setup → Users → Einstein Service Agent User). (3) Assign permission sets for any prompt templates or flows. (4) Click Activate. (5) Deploy to a channel. Agents must be deactivated before editing, then reactivated after changes.'
                    }
                ]
            },
            {
                text: 'Channels',
                sub: 'Experience Cloud, email, Slack, messaging — deploying agents to end users',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_channels.htm',
                details: [
                    {
                        heading: 'Available Channels',
                        text: 'Experience Cloud (web chat embedded in customer portals), Email (agents respond to inbound emails autonomously), Slack (employee-facing agents via Slack apps), SMS/WhatsApp via Messaging for In-App and Web (MIAW), Custom channels via Agent API. Each channel requires separate configuration and may need additional permissions.'
                    },
                    {
                        heading: 'Experience Cloud Deployment',
                        text: 'Most common in exam scenarios. Steps: (1) Create/open an Experience Cloud site in Experience Builder. (2) Add the Messaging component. (3) In Agentforce Builder, go to Channels and select the Experience Cloud site. (4) Publish the site. The agent user must have access to the Experience Cloud site and all objects it queries.'
                    },
                    {
                        heading: 'Escalation to Human Agents',
                        text: 'When an agent cannot resolve an issue, it escalates via the Escalation topic. This transfers the conversation to an Omni-Channel queue where a human agent can pick it up. The full conversation transcript is preserved. Always configure the Escalation topic — it is a Salesforce best practice and appears in exam scenarios.'
                    }
                ]
            },
            {
                text: 'Filters & Variables',
                sub: 'Deterministic behavior, topic filters, input/output variables in agents',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_variables_filters.htm',
                details: [
                    {
                        heading: 'Agent Variables',
                        text: 'Variables allow agents to carry context across a conversation (e.g., storing the verified customer ID). Types: System Variables (auto-populated by Salesforce: userId, orgId, conversationId), Custom Variables (defined by admin to store conversation state). Variables are accessible in topic instructions and action configurations using {!variable.name} syntax.'
                    },
                    {
                        heading: 'Topic & Action Filters',
                        text: 'Filters (GA March 2025) let you control exactly when a topic or action is available to the agent based on conditions. Example: "Only activate the Manage Orders topic if the user is a verified customer." This adds deterministic governance over the agent\'s behavior, reducing the risk of the AI activating a sensitive action for an unauthorized user.'
                    },
                    {
                        heading: 'When to Use Filters',
                        text: 'Use filters when: a topic or action involves sensitive data (account numbers, payment info), the action should only run in specific business contexts (business hours, specific product types), or when compliance requires that certain actions are restricted to verified users. This is an increasingly tested concept in the Specialist exam.'
                    }
                ]
            }
        ],
        usecase: {
            text: 'Build a complete Service Agent from scratch in your Developer org.',
            steps: [
                'Setup → Agentforce Agents → New Agent → choose Agentforce Service Agent template',
                'In Agent Builder, update the Company Context with a fictional company persona and rules',
                'Create a custom topic "Order Status Inquiry" with a clear description and 3 instructions',
                'Add a standard Query Records action tied to the Order object',
                'Test the agent in the Preview panel with 5 sample queries; note how topic matching works',
                'Add the Escalation topic as a safety net and test a query that forces escalation'
            ]
        },
        trailheads: [
            {
                name: 'Quick Start: Build Your First Agent with Agentforce',
                type: 'Project',
                url: 'https://trailhead.salesforce.com/content/learn/projects/quick-start-build-your-first-agent-with-agentforce',
                icon: 'utility:connected_apps'
            },
            {
                name: 'Agentforce Service Agent Quick Look',
                type: 'Module',
                url: 'https://trailhead.salesforce.com/content/learn/modules/agentforce-service-agent-quick-look',
                icon: 'utility:education'
            },
            {
                name: 'Cert Prep: Agentforce Concepts Unit',
                type: 'Module',
                url: 'https://trailhead.salesforce.com/content/learn/modules/cert-prep-agentforce-specialist/review-agentforce-concepts',
                icon: 'utility:check'
            }
        ]
    },
    {
        num: 4,
        title: 'Agentforce for Service & Sales',
        subtitle: 'Configure agents for real CRM use cases across Service Cloud and Sales Cloud including SDR and Employee agents',
        time: '4h',
        examWeight: null,
        color: '#0F6E56',
        bgColor: '#E1F5EE',
        topics: [
            {
                text: 'Agentforce for Service',
                sub: 'Case deflection, knowledge grounding, live agent escalation, 24/7 self-service',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_service.htm',
                details: [
                    {
                        heading: 'Core Capabilities',
                        text: 'Agentforce for Service handles customer inquiries autonomously 24/7. Key capabilities: Case deflection (resolving issues before a case is created), Knowledge article surfacing (grounding responses in your existing KB), Order and account lookups, Appointment scheduling, Escalation to human agents with full context transfer. Unlike Einstein Bots (rule-based dialogs), Agentforce uses generative AI for natural, context-aware responses.'
                    },
                    {
                        heading: 'Configuration Steps',
                        text: 'Enable Agentforce via Setup → Salesforce Go. Configure the Einstein Service Agent User profile. Create the agent using the Agentforce Service Agent template. Add topics relevant to your service scenarios. Connect to a knowledge base via Data Library for grounding. Deploy to your Experience Cloud site or messaging channel. Configure Omni-Channel for escalation routing.'
                    },
                    {
                        heading: 'Key Difference from Einstein Bots',
                        text: 'Einstein Bots use declarative dialogs with specific intents — predictable and explainable, required in regulated industries. Agentforce uses generative AI — more flexible and natural but less deterministic. The exam may ask you to choose between them. Choose Einstein Bots for: strict compliance needs, fully deterministic flows. Choose Agentforce for: natural language flexibility, complex reasoning, 24/7 scale.'
                    }
                ]
            },
            {
                text: 'Agentforce Sales Agent (SDR)',
                sub: 'Prospect outreach, lead qualification, meeting scheduling, email automation',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_sales_sdr.htm',
                details: [
                    {
                        heading: 'What the Sales SDR Agent Does',
                        text: 'The Agentforce Sales Development Representative (SDR) Agent handles top-of-funnel sales tasks autonomously. It can engage inbound leads via email, qualify prospects by asking discovery questions, answer product/pricing FAQs, and schedule meetings directly into a rep\'s calendar. It works within Sales Cloud using CRM data for personalization.'
                    },
                    {
                        heading: 'Key Integrations',
                        text: 'Einstein for Sales (email generation and tracking), Salesforce Calendar (meeting scheduling), Lead and Opportunity objects (data grounding), Prompt Builder (personalizing outreach emails). The SDR agent can hand off qualified leads to human reps with a complete activity history of the AI-driven conversation.'
                    },
                    {
                        heading: 'Sales Coach Agent',
                        text: 'A separate agent type: Sales Coach provides real-time guidance to reps during calls (integrates with conversation intelligence tools). It suggests talk tracks, surfaces competitive battle cards, and helps reps handle objections in real time. Not the same as the SDR agent — Sales Coach augments humans while SDR replaces repetitive outbound/inbound tasks.'
                    }
                ]
            },
            {
                text: 'Employee Agent',
                sub: 'Internal helpdesk, HR queries, IT support, Slack deployment',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_employee.htm',
                details: [
                    {
                        heading: 'Use Cases',
                        text: 'Employee Agents handle internal workforce support tasks: HR queries (PTO balance, benefits, onboarding), IT helpdesk (password resets, software requests, ticket routing), Policy lookups (expense policies, code of conduct), Facilities (room bookings, equipment requests). Deployed via Slack or internal Experience Cloud portals.'
                    },
                    {
                        heading: 'Architecture Differences',
                        text: 'Employee Agents use internal data sources (HR systems, IT ticketing via MCP or API actions, internal knowledge bases). They typically have stricter access controls since they may surface sensitive employee data. The Slack channel is the most common deployment for employee-facing agents. Configure the agent to only respond to authenticated Salesforce users.'
                    },
                    {
                        heading: 'Exam Scenario',
                        text: 'When asked which agent type to deploy: Customer-facing (24/7 support, case deflection) → Service Agent. Outbound/inbound prospect engagement → Sales SDR Agent. Internal employee support via Slack → Employee Agent. A hybrid scenario (employee AND customer use) is a trick question — you need two separate agents.'
                    }
                ]
            },
            {
                text: 'Escalation Best Practices',
                sub: 'Always configure escalation topics, Omni-Channel routing, transcript preservation',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_escalation.htm',
                details: [
                    {
                        heading: 'Why Escalation Matters',
                        text: 'No agent can handle 100% of inquiries. A missing escalation path means customers get stuck in an unresolved AI loop — damaging trust. Salesforce best practice: always include the standard Escalation topic in every customer-facing agent. This topic triggers when the agent cannot resolve an issue or when the user explicitly asks for a human.'
                    },
                    {
                        heading: 'Escalation Configuration',
                        text: 'The Escalation topic transfers the conversation to an Omni-Channel queue. You must configure: Omni-Channel routing rules, which agents/queues receive escalated conversations, the transfer message shown to the customer, and whether the AI conversation transcript is shown to the human agent. Transcript visibility is critical — it prevents the customer from having to repeat themselves.'
                    },
                    {
                        heading: 'Graceful Degradation',
                        text: 'Configure the agent to respond gracefully when it cannot answer: "I don\'t have that information, but I can connect you with a specialist." Add this as an instruction in the Company Context and the Escalation topic instructions. Agents that say "I don\'t know" clearly are better than agents that hallucinate a wrong answer.'
                    }
                ]
            }
        ],
        usecase: {
            text: 'Configure a Service Agent for an e-commerce company handling returns.',
            steps: [
                'Enable Agentforce via Setup → Salesforce Go and confirm Einstein Service Agent User is set',
                'Create a new agent from the Service Agent template; remove all default topics',
                'Add topic: "Return Policy" with description "Handles customer questions about product returns, refunds, and exchanges"',
                'Add a Prompt Action tied to the Case Summary template you built on Day 2',
                'Add the standard Escalation topic',
                'Deploy to an Experience Cloud site and test 10 varied return-related queries'
            ]
        },
        trailheads: [
            {
                name: 'Agentforce for Service — Quick Look',
                type: 'Module',
                url: 'https://trailhead.salesforce.com/content/learn/modules/agentforce-service-agent-quick-look',
                icon: 'utility:service_cloud'
            },
            {
                name: 'Configure Agentforce for Exceptional Service',
                type: 'Project',
                url: 'https://trailhead.salesforce.com/content/learn/projects/quick-start-build-your-first-agent-with-agentforce/configure-an-agentforce-service-agent',
                icon: 'utility:connected_apps'
            },
            {
                name: 'Agentforce for Sales',
                type: 'Module',
                url: 'https://trailhead.salesforce.com/content/learn/modules/agentforce-for-sales',
                icon: 'utility:salesforce1'
            }
        ]
    },
    {
        num: 5,
        title: 'Data 360 (Data Cloud) for Agentforce (20% of Exam)',
        subtitle: 'Learn how Data 360 grounds agents with unified profiles, RAG, Agentforce Data Library, and real-time data retrieval',
        time: '4h',
        examWeight: '20%',
        color: '#185FA5',
        bgColor: '#E6F1FB',
        topics: [
            {
                text: 'Data 360 Fundamentals for Agentforce',
                sub: 'DMOs, unified profiles, data streams, enabling vs. implementing',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.c360_a_data_cloud_overview.htm',
                details: [
                    {
                        heading: 'What Is Data 360 (formerly Data Cloud)?',
                        text: 'Data 360 is Salesforce\'s real-time data platform that ingests data from multiple sources (CRM, external systems, web behavior) and creates Unified Profiles for contacts and accounts. For Agentforce, Data 360 provides the richest data foundation — agents grounded with Data 360 data give more personalized, contextual responses than agents using only standard CRM data.'
                    },
                    {
                        heading: 'Enabling vs. Implementing',
                        text: 'Enabling Data 360: Activating the license in your org unlocks the Einstein Trust Layer and basic Agentforce capabilities. No data setup needed. Implementing Data 360: Connecting data sources, creating Data Model Objects (DMOs), running data transforms to create Unified Profiles, and building retrievers. Full implementation is required for RAG with grounded, personalized responses.'
                    },
                    {
                        heading: 'Key Data 360 Concepts for the Exam',
                        text: 'Data Streams: connections that ingest source data into Data 360. Data Model Objects (DMOs): the unified schema that maps source fields to standard Data 360 fields. Unified Profiles: a merged single view of a person across all data sources. Segments: filtered groups of unified profiles used for targeting. Identity Resolution: the process that merges duplicate profiles.'
                    }
                ]
            },
            {
                text: 'Agentforce Data Library',
                sub: 'Custom retrievers, web search libraries, chunking, indexing unstructured data',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_data_library.htm',
                details: [
                    {
                        heading: 'What Is the Agentforce Data Library?',
                        text: 'The Agentforce Data Library (formerly Einstein Data Library) is the repository that stores data sources for RAG-based grounding. Two types: Custom Retriever Libraries (connect to internal data: PDFs, articles, documents indexed in Einstein Studio), and Web Search Libraries (connect to public web content for external knowledge). Libraries are attached to specific agents in Agent Builder under Data Sources.'
                    },
                    {
                        heading: 'Chunking & Indexing',
                        text: 'Unstructured documents (PDFs, knowledge articles, DOCX files) are processed by splitting them into chunks (typically 512–1024 tokens). Each chunk is converted to a vector embedding and stored in an index. At runtime, when the agent needs information, it converts the user query to a vector and finds the most semantically similar chunks. This is the technical foundation of RAG in Salesforce.'
                    },
                    {
                        heading: 'Custom Retrievers',
                        text: 'Custom retrievers in Einstein Studio let you configure: the data source (Data 360 DMO or file upload), the fields to index, filters (e.g., only index documents tagged "Product Documentation"), and the search type (keyword, semantic, or hybrid). Hybrid search (combining keyword and semantic matching) typically produces the best results for enterprise knowledge bases.'
                    }
                ]
            },
            {
                text: 'RAG with Data 360',
                sub: 'Retrieval-augmented generation, grounding prompts with unified profiles and unstructured data',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_rag.htm',
                details: [
                    {
                        heading: 'How RAG Works in Agentforce',
                        text: 'RAG (Retrieval Augmented Generation) flow: (1) User sends a query. (2) Atlas converts the query to a vector embedding. (3) Relevant document chunks are retrieved from the Data Library index. (4) Retrieved chunks are injected into the prompt as context. (5) The LLM generates a response grounded in that context. (6) Einstein Trust Layer reviews the output before sending to the user.'
                    },
                    {
                        heading: 'Standard vs. Advanced RAG',
                        text: 'Standard RAG (available without full Data 360 implementation): uses the Agentforce Data Library with file uploads and basic knowledge articles. Advanced RAG (requires Data 360 implementation): uses unified profiles for personalization, real-time data via Data 360 API, and custom retrievers with complex filtering. Advanced RAG enables responses like "Based on your recent purchases, here are recommendations..." — impossible with standard RAG alone.'
                    },
                    {
                        heading: 'Exam Focus',
                        text: 'Know that: RAG requires the Agentforce Data Library. The General FAQ standard topic uses basic grounding. The General Web Search topic requires a web search data library and you must remove General FAQ first. Data 360 retrievers support diverse data types (structured, unstructured, real-time). Chunking and indexing are automatic once you set up the library — you configure the strategy, Salesforce handles the technical process.'
                    }
                ]
            },
            {
                text: 'Monitoring Agentforce Analytics',
                sub: 'Data 360 conversation logs, deflection rates, latency, optimization recommendations',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_analytics.htm',
                details: [
                    {
                        heading: 'Agentforce Observability',
                        text: 'Agentforce Observability (GA November 2025) provides analytics dashboards showing: Total sessions, Deflected sessions (resolved by AI without human), Escalated sessions (transferred to human), Average latency per agent turn, Topic activation frequency, and Action success/failure rates. All conversation logs are stored in Data 360 for analysis.'
                    },
                    {
                        heading: 'Using Analytics to Improve Agents',
                        text: 'Low deflection rate → topics are not resolving enough; review topic instructions and add more specific actions. High escalation rate → check if escalation is triggered too aggressively; refine escalation topic instructions. High latency → reduce the complexity of actions, simplify retrievers, or limit data sources. Topic mismatch → improve topic descriptions to be more distinctive.'
                    }
                ]
            }
        ],
        usecase: {
            text: 'Complete the Data 360 and Agentforce hands-on project on Trailhead.',
            steps: [
                'Sign up for the Trailhead Data 360 + Agentforce playground org (separate from your Dev org)',
                'In the playground, create a Data Stream connecting a sample CSV file of product data',
                'Create a Data Model Object mapping the product fields',
                'In Einstein Studio, create a custom retriever targeting the product DMO',
                'Create an Agentforce Data Library using that retriever',
                'In Agent Builder, attach the Data Library to your agent and test queries about products'
            ]
        },
        trailheads: [
            {
                name: 'Get Started with Data 360 and AI',
                type: 'Project',
                url: 'https://trailhead.salesforce.com/content/learn/projects/connect-data-cloud-to-copilot-and-prompt-builder',
                icon: 'utility:database'
            },
            {
                name: 'Implementing Data Cloud for Enhanced Agentforce',
                type: 'Module',
                url: 'https://trailhead.salesforce.com/content/learn/modules/data-cloud-powered-agentforce',
                icon: 'utility:education'
            },
            {
                name: 'Cert Prep: Data Cloud for Agentforce',
                type: 'Module',
                url: 'https://trailhead.salesforce.com/content/learn/modules/cert-prep-agentforce-specialist/review-data-cloud-for-agentforce',
                icon: 'utility:check'
            }
        ]
    },
    {
        num: 6,
        title: 'Flows & Apex as Agent Actions',
        subtitle: 'Extend agent capabilities using Salesforce Flow and Apex InvocableMethods for real data manipulation',
        time: '4h',
        examWeight: null,
        color: '#993C1D',
        bgColor: '#FAECE7',
        topics: [
            {
                text: 'Agent-Ready Flows',
                sub: 'Autolaunched flows, input/output variables, fault paths, clear descriptions',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_flow_actions.htm',
                details: [
                    {
                        heading: 'What Makes a Flow "Agent-Ready"?',
                        text: 'An agent-ready flow is an Autolaunched Flow (No Trigger) specifically designed to be called by an Agentforce action. Key requirements: (1) A clear, detailed description at the flow level — this is placed in the Action Instructions and used by Atlas to understand when to call the flow. (2) Well-described input and output variables with specific descriptions. (3) Fault paths on all error-prone elements. (4) Returning structured, clean output the agent can communicate to the user.'
                    },
                    {
                        heading: 'Input/Output Variable Best Practices',
                        text: 'Input variables: mark as "Available for input" and write clear descriptions (e.g., "The Salesforce ID of the Contact whose open cases should be retrieved"). Output variables: mark as "Available for output" and describe the format (e.g., "A formatted list of open case numbers and subjects as a string"). Limit variables to what the agent actually needs — extra unused variables confuse the reasoning engine.'
                    },
                    {
                        heading: 'Fault Paths',
                        text: 'Every Get Records, HTTP Callout, or DML element can fail. Add fault connectors that set a descriptive error output variable (e.g., "No cases found for this contact."). The agent will then communicate this message to the user naturally. Without fault paths, an agent action failure crashes the entire agent conversation with no user-friendly message.'
                    }
                ]
            },
            {
                text: 'Registering Flows as Agent Actions',
                sub: 'Agentforce Assets, action configuration, input/output labeling',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_actions_flow.htm',
                details: [
                    {
                        heading: 'Steps to Register a Flow Action',
                        text: '(1) Setup → Agentforce Assets → Actions tab → New Agent Action. (2) Reference Action Type: Flow. (3) Reference Action: select your flow. (4) Salesforce auto-populates the Action Instructions from the flow description — review and enhance this text. (5) Configure each input variable: mark required inputs, write clearer labels if needed. (6) Configure each output variable: choose Show in Conversation for outputs the agent should read to the user. (7) Click Finish.'
                    },
                    {
                        heading: 'Show Loading Text',
                        text: 'For long-running flows (>2 seconds), enable "Show loading text" and customize the message (e.g., "Looking up your order details..."). This prevents the user from thinking the agent is unresponsive. For quick lookups, disable this option to reduce message noise.'
                    },
                    {
                        heading: 'Attaching Actions to Topics',
                        text: 'After registering the action, go to Agent Builder → your topic → Actions → Add Action. Select your new flow action. Add action-level instructions that tell the agent when to call this specific action (e.g., "Call this action when the user asks about the status of a specific order and provides an order number."). Without topic-level action instructions, the agent may call the action at wrong times.'
                    }
                ]
            },
            {
                text: 'Apex as Agent Action (@InvocableMethod)',
                sub: 'Creating invocable Apex, parameter best practices, async considerations',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_actions_apex.htm',
                details: [
                    {
                        heading: 'When to Use Apex vs. Flow',
                        text: 'Use Flow for: CRUD operations, simple queries, sending emails, creating tasks — declarative and easier to maintain. Use Apex for: complex logic, external API callouts (via HttpRequest), calculations, string manipulation, data transformation that exceeds flow capabilities. Apex gives full programmatic control but requires a developer.'
                    },
                    {
                        heading: '@InvocableMethod Requirements',
                        text: 'The Apex method must be: public static, annotated with @InvocableMethod(label=\'...\' description=\'...\'), accept a List<> input, and return a List<> output. The label and description in the annotation are used in Agentforce — write them clearly. Input class fields must be annotated with @InvocableVariable(label=\'...\' description=\'...\' required=true/false).'
                    },
                    {
                        heading: 'Sample Pattern',
                        text: 'public class GetOpenCasesAction { @InvocableMethod(label=\'Get Open Cases\' description=\'Retrieves open cases for a contact by their Salesforce Contact ID\') public static List<Result> execute(List<Request> requests) { ... } public class Request { @InvocableVariable(label=\'Contact Id\' required=true) public Id contactId; } public class Result { @InvocableVariable(label=\'Open Cases Summary\') public String casesSummary; } }'
                    }
                ]
            },
            {
                text: 'Action Description Best Practices',
                sub: 'Why descriptions are critical for the Atlas reasoning engine\'s action selection',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_action_descriptions.htm',
                details: [
                    {
                        heading: 'Why Descriptions Matter',
                        text: 'The Atlas Reasoning Engine reads your action descriptions to decide: (1) Should I call this action? (2) What data should I pass as inputs? (3) How should I present the output? A vague description like "Gets cases" leads to missed calls or incorrect calls. A specific description like "Retrieves all open Cases for a given Contact ID, returning case numbers, subjects, and creation dates" gives Atlas everything it needs.'
                    },
                    {
                        heading: 'Description Writing Rules',
                        text: 'Include: what the action does, what input it needs (be specific about format/type), what output it returns, and when NOT to call it (optional but valuable). Avoid: vague verbs ("handles", "manages"), jargon the LLM may not understand, descriptions longer than 200 words. Keep descriptions factual and precise — write for an AI reader, not a human developer.'
                    }
                ]
            }
        ],
        usecase: {
            text: 'Build an Apex-powered agent action for retrieving open cases.',
            steps: [
                'In VS Code or Developer Console, create an Apex class GetOpenCasesAction with @InvocableMethod',
                'The method takes a Contact Id and returns a formatted string of open case numbers and subjects',
                'Add @InvocableVariable annotations with clear labels and descriptions on all fields',
                'Register the Apex class as an Agent Action in Setup → Agentforce Assets',
                'Add the action to the "Order Status Inquiry" topic in your agent from Day 3',
                'Test in Agent Builder preview: ask "What are my open cases?" and verify the action fires'
            ]
        },
        trailheads: [
            {
                name: 'Agentforce Actions: Flows for AI',
                type: 'Module',
                url: 'https://trailhead.salesforce.com/content/learn/modules/agentforce-flow-actions',
                icon: 'utility:flow'
            },
            {
                name: 'Custom Service Agents with Prompt Builder',
                type: 'Module',
                url: 'https://trailhead.salesforce.com/content/learn/modules/custom-service-agents-with-prompt-builder-and-agentforce',
                icon: 'utility:education'
            },
            {
                name: 'Enhance Agentforce with Flow Actions',
                type: 'Module',
                url: 'https://trailhead.salesforce.com/content/learn/projects/connect-data-cloud-to-copilot-and-prompt-builder/enhance-copilot-to-act-on-data-with-conversational-language',
                icon: 'utility:connected_apps'
            }
        ]
    },
    {
        num: 7,
        title: 'Security, Testing & Deployment Lifecycle (20% of Exam)',
        subtitle: 'Manage agent security, test with Testing Center, deploy from sandbox to production, manage agent versions',
        time: '4h',
        examWeight: '20%',
        color: '#993556',
        bgColor: '#FBEAF0',
        topics: [
            {
                text: 'Agentforce Security Model',
                sub: 'Agent User profile, Einstein Agent User, permission sets, channel access',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_security.htm',
                details: [
                    {
                        heading: 'Agent User Profile',
                        text: 'Every Agentforce agent runs as a named "Agent User" — a system user in your Salesforce org. This user\'s profile controls what objects and fields the agent can access. Key profile: Einstein Service Agent User — the standard profile for Service Agents. You can create custom profiles for agents that need different access (e.g., an agent that should only read Accounts but never Opportunities).'
                    },
                    {
                        heading: 'Permission Sets',
                        text: 'Assign permission sets to the agent user to grant access to: Prompt Builder templates (Prompt Template User permission set), specific objects and fields, connected apps (for external API actions), Einstein features. Always follow the principle of least privilege — give agents only the permissions they need to function, nothing more.'
                    },
                    {
                        heading: 'Customer Verification Topic',
                        text: 'The Customer Verification topic (available March 2025+) is a special topic that protects sensitive actions. When a user tries to access a protected topic or action, the agent triggers the verification flow — requesting email, username, or other identity proof — before granting access. Example: protect "Cancel Subscription" or "View Payment Details" behind customer verification.'
                    }
                ]
            },
            {
                text: 'Agentforce Testing Center',
                sub: 'Creating test suites, test cases, expected outcomes, pass/fail scoring',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_testing_center.htm',
                details: [
                    {
                        heading: 'What Is the Testing Center?',
                        text: 'The Agentforce Testing Center (accessible from Agent Builder → Test) is the built-in automated testing tool for agents. You create Test Suites containing multiple Test Cases. Each test case defines: an input message (simulated user query), expected outcome (what topic should activate, what action should run, what the response should contain), and an acceptance threshold (% of runs that must pass).'
                    },
                    {
                        heading: 'Creating Effective Tests',
                        text: 'Test these scenarios: (1) Happy path: normal queries that should succeed. (2) Edge cases: queries with missing info, typos, unusual phrasing. (3) Out-of-scope queries: questions the agent should NOT answer. (4) Sensitive queries: attempts to access protected actions without verification. (5) Escalation triggers: queries that should escalate to a human. Aim for 80% pass rate before deploying to production.'
                    },
                    {
                        heading: 'Interpreting Results',
                        text: 'For each test run, the Testing Center shows: which topic was activated, which action was called, the actual response generated, and pass/fail status. Failed tests indicate: wrong topic matched (fix topic description), wrong action called (fix action instructions), response quality issue (fix topic instructions or prompt template). Run suites after every major configuration change.'
                    }
                ]
            },
            {
                text: 'Deploying Agents: Sandbox to Production',
                sub: 'Change Sets, metadata types, post-deploy validation, agent versioning',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_deploy.htm',
                details: [
                    {
                        heading: 'Deployment Approach',
                        text: 'Agentforce agents are metadata and can be deployed via: Change Sets (Admin-friendly, no code), Salesforce CLI (sf project deploy start — developer approach, supports CI/CD), Unlocked Packages (for ISVs and complex deployments). The Agentforce agent metadata includes: Agent definition, Topics, Actions (Flow/Apex references must also be deployed), Prompt Templates, and Permission Set assignments.'
                    },
                    {
                        heading: 'Pre-Deployment Checklist',
                        text: '(1) Run full Testing Center suite in sandbox — achieve >80% pass rate. (2) Verify all dependent metadata exists in target org (flows, Apex, prompt templates). (3) Confirm Agent User profile and permission sets are in target org. (4) Ensure Data Library and Data 360 configuration is replicated. (5) Plan deployment timing (off-peak hours). (6) Have rollback plan ready (deactivate agent if issues arise).'
                    },
                    {
                        heading: 'Agent Versioning',
                        text: 'Agent versioning (GA 2025) lets you create new versions of an agent without modifying the live production version. Use versioning to: test configuration changes safely, stage new features before release, maintain rollback versions. Versions are managed in Agent Builder → agent Details page. You can switch the active version at any time without redeployment.'
                    }
                ]
            },
            {
                text: 'Monitoring Agent Adoption',
                sub: 'Agentforce Observability, session analytics, adoption reporting',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_monitoring.htm',
                details: [
                    {
                        heading: 'Post-Deployment Monitoring',
                        text: 'After going live, monitor via Agentforce Observability dashboards: Total sessions (volume), Deflection rate (% resolved by AI without escalation — target 60%+), Escalation rate (% transferred to humans), CSAT scores if survey integrated, Average turns per conversation, Common failure topics. Review these weekly in the first month post-launch.'
                    },
                    {
                        heading: 'Continuous Improvement',
                        text: 'Use conversation logs in Data 360 to identify: frequently asked questions the agent fails to answer (→ create new topics or improve existing ones), user abandonment points (→ simplify agent responses), recurring escalation triggers (→ decide if AI can handle these or if human handling is appropriate). This creates a feedback loop for agent improvement.'
                    }
                ]
            }
        ],
        usecase: {
            text: 'Build and run a Testing Center suite for your agent.',
            steps: [
                'In Agent Builder, open Testing Center for your Service Agent',
                'Create a Test Suite "Service Agent Regression Tests"',
                'Add 10 test cases: 3 happy path, 2 edge cases, 2 out-of-scope, 2 escalation, 1 security',
                'Run the suite and review results — identify any failures and fix the related topic/action configs',
                'Add a Customer Verification requirement to a sensitive action (e.g., Cancel Order)',
                'Create a Change Set in a sandbox and add the agent metadata + dependent flows'
            ]
        },
        trailheads: [
            {
                name: 'Update Agentforce Concepts for Certification',
                type: 'Module',
                url: 'https://trailhead.salesforce.com/content/learn/modules/agentforce-specialist-certification-maintenance-summer-25/get-up-to-date-on-agentforce-concepts',
                icon: 'utility:education'
            },
            {
                name: 'Cert Prep: Deployment Lifecycle',
                type: 'Module',
                url: 'https://trailhead.salesforce.com/content/learn/modules/cert-prep-agentforce-specialist/review-the-agentforce-deployment-lifecycle',
                icon: 'utility:check'
            },
            {
                name: 'Agentforce Security & User Management',
                type: 'Module',
                url: 'https://trailhead.salesforce.com/content/learn/modules/agentforce-security',
                icon: 'utility:shield'
            }
        ]
    },
    {
        num: 8,
        title: 'Monitoring, MCP, Agent APIs & Advanced Topics',
        subtitle: 'Agentforce Observability, Model Context Protocol, Agent API, Agent-to-Agent protocol, and the new Agentforce Builder',
        time: '4h',
        examWeight: null,
        color: '#3B6D11',
        bgColor: '#EAF3DE',
        topics: [
            {
                text: 'Model Context Protocol (MCP)',
                sub: 'Purpose, use cases, connecting external systems to Agentforce agents',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_mcp.htm',
                details: [
                    {
                        heading: 'What Is MCP?',
                        text: 'Model Context Protocol (MCP) is an open standard (originally created by Anthropic, adopted industry-wide) that defines how AI models communicate with external tools and data sources. In Agentforce, MCP allows agents to connect to external systems (databases, APIs, legacy apps) in a standardized way without building custom integrations for each system.'
                    },
                    {
                        heading: 'MCP in Salesforce',
                        text: 'Salesforce supports MCP as an integration method for agent actions. An external system exposes an MCP server with defined tools (functions the agent can call). The Agentforce agent connects to the MCP server and can invoke those tools as agent actions. This enables agents to interact with non-Salesforce systems (Jira, ServiceNow, SAP, custom databases) without full API integration code.'
                    },
                    {
                        heading: 'Exam Context',
                        text: 'Know that MCP is an open protocol, not a Salesforce-proprietary technology. It is particularly useful for connecting legacy enterprise systems to Agentforce. Compare it to direct API actions: MCP provides a standardized discovery mechanism (the agent can discover available tools dynamically), while direct API actions require manual configuration of each endpoint.'
                    }
                ]
            },
            {
                text: 'Agent API & Agent-to-Agent Protocol',
                sub: 'Programmatic agent invocation, multi-agent systems, orchestration patterns',
                docUrl: 'https://developer.salesforce.com/docs/einstein/genai/guide/agent-api.html',
                details: [
                    {
                        heading: 'Agent API',
                        text: 'The Agent API allows external systems and custom applications to invoke Agentforce agents programmatically via REST. Use cases: embedding Agentforce in a mobile app (instead of a Salesforce channel), calling an agent from a custom web application, triggering agent conversations from external events (e.g., a webhook fires when a new support ticket arrives). Authentication uses OAuth 2.0 connected apps.'
                    },
                    {
                        heading: 'Agent-to-Agent Protocol',
                        text: 'Agent-to-Agent (A2A) protocol enables multiple Agentforce agents to collaborate — one "orchestrator" agent delegates tasks to specialist "worker" agents. Example: an Orchestrator Sales Agent receives a complex request, delegates lead research to a Research Agent, sends personalized email via an Outreach Agent, and schedules meeting via a Calendar Agent. This enables multi-agent systems for complex enterprise workflows.'
                    },
                    {
                        heading: 'When to Use Agent API',
                        text: 'Use Agent API when: you need to integrate Agentforce into a non-Salesforce UI, you have an existing customer portal that is not on Experience Cloud, you want to trigger agent conversations programmatically from external events, or you are building a custom mobile app powered by Agentforce. Do not use Agent API when a standard Agentforce channel (Experience Cloud, Slack, email) already meets the need.'
                    }
                ]
            },
            {
                text: 'New Agentforce Builder (GA Feb 2026)',
                sub: 'Canvas UI, Agent Script language, hybrid reasoning engine, topic pass-through',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_new_builder.htm',
                details: [
                    {
                        heading: 'What\'s New',
                        text: 'The new Agentforce Builder (GA February 2026) introduces a next-generation building experience. Canvas View: a visual no-code interface for configuring topics and actions with a flowchart-style UI. Agent Script: a new declarative language for defining agents in code (similar to YAML/JSON), enabling version control and CI/CD integration. Hybrid Reasoning Engine: combines generative AI flexibility with deterministic control flows for specific logic paths.'
                    },
                    {
                        heading: 'Agent Script',
                        text: 'Agent Script allows developers to define agents using code instead of point-and-click. Benefits: version control in Git, code review process, programmatic generation of agent configurations, easier migration across orgs. The script defines topics, actions, instructions, and control flows. Developers can write script in VS Code or directly in the new Builder\'s Script View.'
                    },
                    {
                        heading: 'Topic Pass-Through',
                        text: 'Topic pass-through (new feature) allows the agent to chain actions across multiple topics seamlessly. Previously, if a user\'s request spanned two topics, the agent would complete one topic and restart fresh. With pass-through, the agent carries context across topics — enabling more natural multi-step workflows without the user needing to re-state context.'
                    }
                ]
            },
            {
                text: 'Agentforce Observability',
                sub: 'Conversation logs, session analytics, fine-tuning topic instructions from data',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_observability.htm',
                details: [
                    {
                        heading: 'Observability Features',
                        text: 'Agentforce Observability (GA November 2025) provides: Conversation Logs (full transcripts of every session stored in Data 360), Session Metrics (total sessions, deflection rate, escalation rate, avg latency), Topic Performance (which topics are activated most, which have high failure rates), Action Performance (which actions are called, success/failure rates), Optimization Recommendations (Salesforce AI suggests topic instruction improvements based on patterns).'
                    },
                    {
                        heading: 'Optimization Workflow',
                        text: 'Weekly review process: (1) Check deflection rate — if below target, find which topics have the most unresolved sessions. (2) Review conversation logs for those topics. (3) Identify common patterns in failed conversations. (4) Update topic instructions or add new actions to address the gap. (5) Re-test in Testing Center. (6) Deploy updated agent version. (7) Monitor for improvement next week.'
                    }
                ]
            }
        ],
        usecase: {
            text: 'Explore Agentforce Observability and the new Agentforce Builder.',
            steps: [
                'Run 15+ test conversations with your agent in the Developer org',
                'Open Agentforce Observability and review the session dashboard',
                'Find one conversation where the agent gave a poor response and read the full transcript',
                'Update the relevant topic instruction based on what you learned',
                'Explore the new Agentforce Builder (Canvas view) to see the visual topic/action mapping',
                'Research Agent API by reading the Salesforce Developer docs and review the authentication flow'
            ]
        },
        trailheads: [
            {
                name: 'New Agentforce & Data Cloud Features (Summer \'25)',
                type: 'Module',
                url: 'https://trailhead.salesforce.com/content/learn/modules/agentforce-specialist-certification-maintenance-summer-25/learn-whats-new-with-agentforce-and-data-cloud',
                icon: 'utility:new_window'
            },
            {
                name: 'Agentblazer Legend Trail',
                type: 'Trail',
                url: 'https://trailhead.salesforce.com/agentblazer',
                icon: 'utility:trail'
            },
            {
                name: 'Agentforce Developer Docs — Agent API',
                type: 'Docs',
                url: 'https://developer.salesforce.com/docs/einstein/genai/guide/agent-api.html',
                icon: 'utility:code'
            }
        ]
    },
    {
        num: 9,
        title: 'Full Review, Practice Exam & Certification Prep',
        subtitle: 'Consolidate all 5 exam domains, flashcard review, capstone build, and final exam registration',
        time: '4–5h',
        examWeight: null,
        isFinal: true,
        color: '#5F5E5A',
        bgColor: '#F1EFE8',
        topics: [
            {
                text: 'Exam Domain Review',
                sub: 'Prompt Engineering 30% + Agentforce Concepts 30% + Data 360 20% + Deployment 20%',
                docUrl: 'https://trailhead.salesforce.com/content/learn/modules/cert-prep-agentforce-specialist',
                details: [
                    {
                        heading: 'Domain Weights',
                        text: 'Prompt Engineering (30%): Prompt Builder, template types, grounding, testing prompts. Agentforce Concepts (30%): Topics, actions, agent types, channels, reasoning engine, filters, variables. Data Cloud/360 for Agentforce (20%): Data Library, RAG, retrievers, chunking, enabling vs. implementing. Deployment Lifecycle (20%): Testing Center, deployment, security, monitoring, versioning. Total: 60 questions, 105 minutes, 73% to pass.'
                    },
                    {
                        heading: 'High-Value Study Areas',
                        text: 'These concepts appear most frequently in exam scenarios: (1) When to use each prompt template type. (2) How topic descriptions affect agent routing. (3) RAG vs. merge field grounding — when to use which. (4) Agent User security model and permission sets. (5) Testing Center pass/fail logic. (6) Difference between standard RAG and Data 360 advanced RAG. (7) Escalation topic best practices.'
                    },
                    {
                        heading: 'Exam Format Tips',
                        text: 'Questions are scenario-based — "A company wants to do X, what is the BEST approach?" Eliminate clearly wrong answers first. When two answers seem correct, pick the one that follows Salesforce best practices (e.g., "always include Escalation topic", "use least privilege for agent user", "test in sandbox before production"). Do not overthink — Salesforce exams reward knowing their recommended approach.'
                    }
                ]
            },
            {
                text: 'Flashcard Review & Weak Areas',
                sub: 'Trailhead cert prep flashcards, targeted review of low-scoring topics',
                docUrl: 'https://trailhead.salesforce.com/content/learn/modules/cert-prep-agentforce-specialist',
                details: [
                    {
                        heading: 'Using Trailhead Flashcards',
                        text: 'The Agentforce Specialist Cert Prep module includes interactive flashcards for each of the 5 exam domains. Complete all 5 unit flashcard decks. Mark cards you got wrong and review those first. Aim to get through all flashcards with >90% accuracy before sitting the exam. Flashcards cover definitions, scenario matching, and key distinction questions.'
                    },
                    {
                        heading: 'Practice Exam Sources',
                        text: 'FocusOnForce Agentforce Specialist Practice Exams (paid, highly recommended). Trailhead Cert Prep module quizzes (free, built-in). Trailblazer Community study groups. Salesforce Ben exam guide. Take at least 2 full practice exams (60 questions each) and review every wrong answer before booking the real exam.'
                    }
                ]
            },
            {
                text: 'Capstone Build',
                sub: 'End-to-end agent covering all 9 days of learning in one complete build',
                docUrl: 'https://help.salesforce.com/s/articleView?id=sf.agentforce_intro.htm',
                details: [
                    {
                        heading: 'Capstone Requirements',
                        text: 'Build a "Customer Support Bot" agent that includes: (1) 3 custom topics: Billing, Returns, Technical Support. (2) At least 2 Flow-based actions across the topics. (3) 1 Apex action with proper @InvocableMethod annotations. (4) 1 Prompt Builder Flex template used as an agent action. (5) Data Library with a grounded knowledge base. (6) Customer Verification on the Billing topic. (7) 10 Testing Center test cases passing at >80%.'
                    },
                    {
                        heading: 'What This Proves',
                        text: 'Completing this capstone demonstrates you can: configure agents with multiple topics and actions, extend agents with custom automation, use prompt engineering in real agent contexts, apply security best practices, ground agents with real data, and validate agent behavior before deployment. This is the exact skill set the Agentforce Specialist exam validates.'
                    }
                ]
            },
            {
                text: 'Exam Registration & Logistics',
                sub: 'Webassessor registration, exam format, ID requirements, retake policy',
                docUrl: 'https://trailhead.salesforce.com/credentials/agentforcespecialist',
                details: [
                    {
                        heading: 'Registration',
                        text: 'Register at webassessor.com/salesforce. Exam: Salesforce Agentforce Specialist. Format: 60 multiple-choice questions + scenario-based, 105 minutes. Delivery: online proctored (from home) or test center. Passing score: 73%. Exam fee: $200 USD (first attempt was free until Dec 31, 2025 — verify current pricing when booking).'
                    },
                    {
                        heading: 'Exam Day Tips',
                        text: 'For online proctored: clear desk of all items, ensure stable internet, have government ID ready, test your camera/audio 24h before. During exam: read every answer before choosing, watch for "BEST", "MOST", "LEAST" qualifiers — they change the correct answer. Flag uncertain questions and return to them. Do not spend more than 90 seconds on any single question.'
                    },
                    {
                        heading: 'Maintenance',
                        text: 'Once certified, you must complete the annual Agentforce Specialist maintenance module on Trailhead (released every summer) by the maintenance due date to keep your certification active. The maintenance covers new features released in the past year. Budget 2-3 hours for the maintenance module each year.'
                    }
                ]
            }
        ],
        usecase: {
            text: 'Complete the capstone build and take 2 full practice exams.',
            steps: [
                'Build the "Customer Support Bot" agent meeting all capstone requirements listed in the topic details',
                'Run the full Testing Center suite and achieve >80% pass rate on all test cases',
                'Take the FocusOnForce practice exam (60 questions) under timed conditions',
                'Review all incorrect answers and re-read the relevant Trailhead module sections',
                'Take a second practice exam the following day and aim for >80% score',
                'Register on Webassessor and schedule your Agentforce Specialist exam'
            ]
        },
        trailheads: [
            {
                name: 'Cert Prep: Agentforce Specialist (Full Module)',
                type: 'Module',
                url: 'https://trailhead.salesforce.com/content/learn/modules/cert-prep-agentforce-specialist',
                icon: 'utility:check'
            },
            {
                name: 'Agentblazer Champion 2026 Trail',
                type: 'Trail',
                url: 'https://trailhead.salesforce.com/agentblazer',
                icon: 'utility:trail'
            },
            {
                name: 'Agentforce Specialist Exam Guide — FocusOnForce',
                type: 'External',
                url: 'https://focusonforce.com/courses/agentforce-ai-specialist-study-guide/',
                icon: 'utility:new_window'
            }
        ]
    }
];

export default class AgentforceStudyPlan extends LightningElement {
    @track currentIndex = 0;
    @track completed = new Array(9).fill(false);
    @track activeTopicText = null;

    get days() {
        return DAYS_DATA.map((d, i) => ({
            ...d,
            index: i,
            isActive: i === this.currentIndex,
            tabClass: `tab-btn ${i === this.currentIndex ? 'tab-btn--active' : ''}`,
            segClass: `prog-seg ${this.completed[i] ? 'prog-seg--done' : i === this.currentIndex ? 'prog-seg--active' : ''}`
        }));
    }

    get activeDay() {
        const d = DAYS_DATA[this.currentIndex];
        return {
            ...d,
            index: this.currentIndex,
            completeIcon: this.completed[this.currentIndex] ? 'utility:check' : 'utility:add',
            completeVariant: this.completed[this.currentIndex] ? 'success' : 'neutral',
            completeTitle: this.completed[this.currentIndex] ? 'Mark incomplete' : 'Mark as complete'
        };
    }

    get activeTopic() {
        if (!this.activeTopicText) return null;
        const day = DAYS_DATA[this.currentIndex];
        return day.topics.find(t => t.text === this.activeTopicText) || null;
    }

    get activeDayHeaderStyle() {
        const d = DAYS_DATA[this.currentIndex];
        return `background: ${d.bgColor};`;
    }

    get activeDayBadgeStyle() {
        const d = DAYS_DATA[this.currentIndex];
        return `background: ${d.color}; color: #fff;`;
    }

    get activeDayDotStyle() {
        return `background: ${DAYS_DATA[this.currentIndex].color};`;
    }

    get completedCount() {
        return this.completed.filter(Boolean).length;
    }

    get progressPct() {
        return Math.round((this.completedCount / 9) * 100);
    }

    get hasPrev() {
        return this.currentIndex > 0;
    }

    get hasNext() {
        return this.currentIndex < 8;
    }

    handleTabClick(event) {
        this.currentIndex = parseInt(event.currentTarget.dataset.index, 10);
        this.activeTopicText = null;
    }

    handleSegClick(event) {
        this.currentIndex = parseInt(event.currentTarget.dataset.index, 10);
        this.activeTopicText = null;
    }

    toggleComplete(event) {
        const idx = parseInt(event.currentTarget.dataset.index, 10);
        const updated = [...this.completed];
        updated[idx] = !updated[idx];
        this.completed = updated;
    }

    handleTopicClick(event) {
        const topicText = event.currentTarget.dataset.topic;
        this.activeTopicText = this.activeTopicText === topicText ? null : topicText;
    }

    closeTopic() {
        this.activeTopicText = null;
    }

    goPrev() {
        if (this.hasPrev) {
            this.currentIndex -= 1;
            this.activeTopicText = null;
        }
    }

    goNext() {
        if (this.hasNext) {
            this.currentIndex += 1;
            this.activeTopicText = null;
        }
    }

    openExamLink() {
        window.open('https://webassessor.com/salesforce', '_blank');
    }
}