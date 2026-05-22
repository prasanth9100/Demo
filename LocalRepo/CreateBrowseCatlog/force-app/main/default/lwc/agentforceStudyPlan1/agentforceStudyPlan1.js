import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

// ─── Validated Salesforce Help + Trailhead URLs ──────────────────────────────
// Salesforce Help uses: https://help.salesforce.com/s/articleView?id=ai.<articleId>.htm&type=5
// Trailhead uses:       https://trailhead.salesforce.com/content/learn/modules/<moduleId>
// salesforce.com guide: https://www.salesforce.com/agentforce/guide/
// ─────────────────────────────────────────────────────────────────────────────

const DAYS_DATA = [
  {
    num: 1,
    title: 'Foundations of Agentforce & AI Concepts',
    subtitle: 'What Agentforce is, the Third Wave of AI, Einstein Trust Layer, Atlas Reasoning Engine, and agent types',
    time: '4h', examWeight: null, color: '#5A4FCF', bgColor: '#EEEDFE',
    helpLinks: [
      { title: 'Agentforce Overview (Salesforce Guide)', url: 'https://www.salesforce.com/agentforce/guide/' },
      { title: 'How Agentforce Works', url: 'https://www.salesforce.com/agentforce/how-it-works/' },
      { title: 'Agentforce Considerations', url: 'https://help.salesforce.com/s/articleView?id=ai.copilot_considerations.htm&type=5' },
      { title: 'Einstein Trust Layer Overview', url: 'https://help.salesforce.com/s/articleView?id=ai.einstein_trust_layer.htm&type=5' },
    ],
    trailheads: [
      { name: 'Introduction to Agentforce', type: 'Module', url: 'https://trailhead.salesforce.com/content/learn/modules/introduction-to-agentforce', icon: 'utility:education' },
      { name: 'Get Ready for Agentforce', type: 'Trail', url: 'https://trailhead.salesforce.com/content/learn/trails/get-ready-for-agentforce', icon: 'utility:trail' },
      { name: 'Agentblazer Champion', type: 'Trail', url: 'https://trailhead.salesforce.com/agentblazer', icon: 'utility:ribbon' },
    ],
    topics: [
      {
        text: 'What is Agentforce?',
        sub: 'Third Wave of AI, copilots vs. autonomous agents, digital labor platform',
        docUrl: 'https://www.salesforce.com/agentforce/guide/',
        details: [
          { heading: 'Overview', text: 'Agentforce is the Third Wave of AI — beyond copilots (AI that assists humans) to fully autonomous agents that act independently. It is Salesforce\'s digital labor platform deploying AI agents across sales, service, marketing, and commerce without constant human input.' },
          { heading: 'Three Waves of AI', text: 'First Wave: Rule-based AI (Einstein Predictions, deterministic logic). Second Wave: Copilots (Einstein Copilot — suggests next steps, human decides). Third Wave: Autonomous Agents — Agentforce independently plans, reasons, and executes multi-step tasks based on a goal.' },
          { heading: 'Business Case', text: 'Agentforce lets companies scale operations without scaling headcount. Agents handle repetitive, structured tasks 24/7 — freeing humans for complex, high-value work. This is the core exam scenario framing.' },
        ]
      },
      {
        text: 'Einstein Trust Layer',
        sub: 'Data masking, zero data retention, toxicity detection, audit trails',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.einstein_trust_layer.htm&type=5',
        details: [
          { heading: 'What It Is', text: 'The Einstein Trust Layer is the security and compliance backbone for every AI feature in Salesforce. ALL LLM calls from Agentforce pass through this layer before reaching any external model. It guarantees no customer data is stored by third-party LLM providers.' },
          { heading: 'Key Capabilities', text: 'Dynamic Grounding: injects CRM data into prompts. Data Masking: PII is masked before leaving Salesforce. Zero Data Retention: LLM providers contractually cannot retain your data. Toxicity Detection: filters harmful AI outputs. Audit Trail: every AI interaction is logged in Einstein Activity Audit.' },
          { heading: 'Exam Tip', text: 'The Trust Layer is always between Salesforce and the LLM — it cannot be bypassed. Data masking and zero data retention are the most exam-tested aspects. Enabling Einstein (not Data 360) activates the Trust Layer.' },
        ]
      },
      {
        text: 'Atlas Reasoning Engine',
        sub: 'How agents plan, reason, and take autonomous multi-step actions',
        docUrl: 'https://www.salesforce.com/agentforce/guide/',
        details: [
          { heading: 'How It Works', text: 'Atlas is the brain of every Agentforce agent. It follows a plan-act-observe loop: (1) Understand user intent. (2) Match to a Topic. (3) Select the best Action. (4) Execute it. (5) Evaluate output. (6) Formulate a natural-language response. (7) Decide: respond, ask clarification, or escalate.' },
          { heading: 'Determinism', text: 'By default Atlas is non-deterministic (generative). You add deterministic behavior via Topic Filters and Variables to enforce specific logic paths — critical for regulated industries or high-stakes actions like financial transactions.' },
          { heading: 'Key Exam Point', text: 'Topics, Instructions, and Actions are the three "levers" you control to influence Atlas reasoning. Writing clear, specific Topic descriptions and Action instructions is the most important configuration skill for the exam.' },
        ]
      },
      {
        text: 'Agent Types Overview',
        sub: 'Service Agent, Sales Agent, Employee Agent — when to use each',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.copilot_considerations.htm&type=5',
        details: [
          { heading: 'Service Agent', text: 'External customer-facing channel (Experience Cloud, web chat, SMS, WhatsApp). Handles case deflection, order inquiries, knowledge article lookups, and escalation. Most common agent type in exam scenarios.' },
          { heading: 'Sales Agent (SDR)', text: 'Handles inbound/outbound prospect engagement. Qualifies leads, sends personalized emails via Einstein for Sales, schedules meetings, handles objections. Works within Sales Cloud CRM data.' },
          { heading: 'Employee Agent', text: 'Internal-facing for HR queries, IT helpdesk, policy lookups, and onboarding. Deployed via Slack or internal portals. Uses internal knowledge bases and flows to resolve employee requests autonomously.' },
        ]
      },
    ],
    usecase: {
      text: 'Explore your Developer org and understand how Agentforce is structured.',
      steps: [
        'Sign up at developer.salesforce.com for a free Agentforce Developer Edition org',
        'Navigate to Setup → Agentforce Agents and browse all available templates',
        'Open a template in Agent Builder — note the Topics, Actions, and Channel configuration',
        'Navigate to Setup → Einstein → review Einstein Activity Audit and Trust Layer settings',
        'Read the Agentforce Guide at salesforce.com/agentforce/guide — bookmark it for reference',
      ]
    },
    studyDoc: [
      { heading: 'What is Agentforce?', content: 'Agentforce is Salesforce\'s autonomous AI agent platform — the Third Wave of AI. First Wave was rule-based predictions. Second Wave was copilots that suggest actions for humans. Third Wave (Agentforce) agents independently plan, reason, and execute multi-step tasks. Salesforce positions it as a "digital labor platform" that augments human workers at scale.' },
      { heading: 'Atlas Reasoning Engine', content: 'The Atlas Reasoning Engine is the decision-making core of every agent. It processes user input, matches it to a configured Topic, selects an Action, executes it, evaluates the result, and formulates a response — all autonomously. This plan-act-observe loop repeats until the task is complete or needs escalation.', bullets: ['Topics define what the agent can handle', 'Instructions tell the agent how to behave', 'Actions are the tools the agent uses to get work done'] },
      { heading: 'Einstein Trust Layer', content: 'Every LLM call from Agentforce passes through the Einstein Trust Layer before reaching an external AI model. Key protections: Dynamic data masking (PII is masked), Zero data retention (LLMs cannot store your data), Toxicity detection (harmful outputs are filtered), and Audit trails (all AI interactions are logged). This layer is always active and cannot be bypassed.' },
      { heading: 'Agent Types', content: 'Three main types: Service Agent (customer-facing, handles support, case deflection), Sales Agent/SDR (prospect engagement, lead qualification, meeting scheduling), Employee Agent (internal helpdesk, HR queries, IT support via Slack). Choose based on the audience: external customers → Service, prospects → Sales, internal employees → Employee.' },
      { heading: 'Day 1 Key Exam Tips', content: 'The exam tests scenarios: "A company needs 24/7 customer support without scaling headcount → Agentforce Service Agent." Know the Trust Layer cannot be bypassed. Know that enabling Einstein (not Data 360) activates the Trust Layer. Know the three waves of AI. Know when to use each agent type.', bullets: ['Third Wave = Autonomous (not just copilot)', 'Trust Layer = always on, always between SF and LLM', 'Einstein activation = Trust Layer activation', 'Einstein Bots = deterministic; Agentforce = generative'] },
    ]
  },
  {
    num: 2,
    title: 'Prompt Engineering (30% of Exam)',
    subtitle: 'Master prompt design, Prompt Builder configuration, grounding techniques, and template types',
    time: '4h', examWeight: '30%', color: '#B56C0E', bgColor: '#FEF3E2',
    helpLinks: [
      { title: 'Prompt Builder Overview', url: 'https://help.salesforce.com/s/articleView?id=ai.prompt_builder_overview.htm&type=5' },
      { title: 'Create a Prompt Template', url: 'https://help.salesforce.com/s/articleView?id=ai.prompt_builder_create.htm&type=5' },
      { title: 'Prompt Template Types', url: 'https://help.salesforce.com/s/articleView?id=ai.prompt_builder_template_types.htm&type=5' },
      { title: 'Ground Prompts with Data', url: 'https://help.salesforce.com/s/articleView?id=ai.prompt_builder_grounding.htm&type=5' },
    ],
    trailheads: [
      { name: 'Large Language Models (Prompt Engineering)', type: 'Module', url: 'https://trailhead.salesforce.com/content/learn/modules/large-language-models', icon: 'utility:education' },
      { name: 'Build Prompts with Prompt Builder', type: 'Module', url: 'https://trailhead.salesforce.com/content/learn/modules/prompt-builder', icon: 'utility:edit' },
      { name: 'Cert Prep: Prompt Engineering Unit', type: 'Module', url: 'https://trailhead.salesforce.com/content/learn/modules/cert-prep-agentforce-specialist/review-prompt-engineering-for-agentforce', icon: 'utility:check' },
    ],
    topics: [
      {
        text: 'Prompt Engineering Principles',
        sub: 'Zero-shot, few-shot, chain-of-thought, role prompting',
        docUrl: 'https://trailhead.salesforce.com/content/learn/modules/large-language-models',
        details: [
          { heading: 'Core Techniques', text: 'Zero-shot: Give instructions without examples — simple but less reliable. Few-shot: Provide 2–5 input-output examples — significantly improves consistency. Chain-of-thought: Ask the model to "think step by step" — improves reasoning on complex tasks. Role prompting: "You are a Salesforce service agent..." — sets persona and tone.' },
          { heading: 'Prompt Structure Best Practices', text: 'Good prompts include: a clear role/persona, a specific task, context data (merge fields), output format requirements (length, structure), and tone instructions. Vague prompts lead to inconsistent agent responses — this is the biggest source of agent failures in production.' },
          { heading: 'Hallucination Prevention', text: 'Add: "Only use the information provided in the context. If you do not know the answer, say so clearly." Ground prompts with actual CRM data via merge fields. The more specific the context, the less the LLM will "fill gaps" with hallucinated information.' },
        ]
      },
      {
        text: 'Prompt Builder & Template Types',
        sub: 'Field generation, record summary, flex templates — when to use each',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.prompt_builder_overview.htm&type=5',
        details: [
          { heading: 'Prompt Builder', text: 'Accessible via Setup → Prompt Builder. Admins create templates declaratively; developers can extend via Apex. Templates are versioned and tied to specific roles and actions. Two key permission sets: Prompt Template Manager (create/edit), Prompt Template User (execute).' },
          { heading: 'Template Types', text: 'Field Generation: auto-populates a single record field (e.g., write a case description based on subject). Record Summary: generates a text summary for a record and its related data (e.g., summarize a contact\'s activity). Flex: most flexible — used in agent actions, takes dynamic input at runtime, not tied to a specific object or field.' },
          { heading: 'Which to Use When', text: 'Field Generation → auto-fill a specific field on a record. Record Summary → display a natural language summary on a record page. Flex → power an Agentforce agent action (most common in the exam). The Flex type is the most important to understand for Agentforce integration.' },
        ]
      },
      {
        text: 'Grounding Techniques',
        sub: 'Merge fields, static text, RAG — how to give agents accurate context',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.prompt_builder_grounding.htm&type=5',
        details: [
          { heading: 'What is Grounding?', text: 'Grounding means injecting real, factual data into a prompt so the AI responds based on your actual business data — not generic training knowledge. Ungrounded prompts lead to hallucinations and generic responses that do not reflect your specific use case.' },
          { heading: 'Methods', text: 'Merge Fields: insert specific field values from CRM records ({!Case.Subject}, {!Account.Name}). Low latency, simple, accurate for known fields. Static Text: hardcode company policies or product info directly in the template — for information that rarely changes. RAG: dynamically retrieve relevant document chunks at runtime — most powerful, requires Agentforce Data Library.' },
          { heading: 'Exam Decision Tree', text: 'Specific record field value → merge field. Company policy / static rules → static text. Large knowledge base / documents / FAQs that change → RAG with Data Library. Personalized customer profile data → RAG with Data 360 advanced retriever.' },
        ]
      },
      {
        text: 'Testing & Refining Prompts',
        sub: 'Preview panel, iterative testing, evaluating output quality',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.prompt_builder_create.htm&type=5',
        details: [
          { heading: 'Testing in Prompt Builder', text: 'The Preview panel lets you select a record and see the generated output in real time. Always test with multiple records — edge cases (missing fields, unusual values, different languages) before associating with an agent action. Look for: hallucinations, format issues, length problems, and wrong tone.' },
          { heading: 'Iteration Cycle', text: 'Write → Preview with 5+ records → Identify issues → Add constraints → Re-test → Save new version. Never modify a live template version — create new versions to preserve history. Associate the new version with your agent action only after it passes testing.' },
          { heading: 'Common Fixes', text: '"Too verbose" → "Respond in 2-3 sentences maximum." "Off-topic" → "Only answer questions about [X]." "Wrong format" → provide an example output format. "Missing field errors" → "If {!Field} is blank, state that the information is unavailable."' },
        ]
      },
    ],
    usecase: {
      text: 'Build and test a Case Summary prompt template in Prompt Builder.',
      steps: [
        'Setup → Prompt Builder → New → Record Summary → select Case object',
        'Add merge fields: {!Case.Subject}, {!Case.Description}, {!Case.Account.Name}',
        'Write: "You are a Salesforce service agent. Summarize this case in 3 sentences max, highlighting the main issue and any recent updates."',
        'Test with 5 different Case records — check for consistency and accuracy',
        'Try adding few-shot examples for cases with missing Description fields',
        'Save the template and note the API name — you will use it as an agent action on Day 3',
      ]
    },
    studyDoc: [
      { heading: 'Prompt Engineering Core Concepts', content: 'Prompt engineering is the practice of writing clear, structured instructions for AI models to produce reliable, relevant outputs. In Salesforce, this applies directly to Prompt Builder templates used in Agentforce agent actions. Good prompts have: a clear role, a specific task, grounded context data, output format instructions, and tone guidance.' },
      { heading: 'Prompt Builder', content: 'Setup → Prompt Builder. Create versioned prompt templates for three use cases. Manage permissions with Prompt Template Manager (create/edit) and Prompt Template User (execute) permission sets.', bullets: ['Field Generation: auto-fill a specific field on a record', 'Record Summary: generate a natural language summary of a record', 'Flex: power agent actions — most important for Agentforce'] },
      { heading: 'Grounding', content: 'Grounding injects real data into prompts to prevent hallucinations. Three methods: (1) Merge fields — specific CRM field values, (2) Static text — hardcoded policies/rules, (3) RAG — dynamic document retrieval at runtime. Use the right method based on the data type and how frequently it changes.' },
      { heading: 'Testing Best Practices', content: 'Always test with 5+ diverse records including edge cases. Use the Preview panel in Prompt Builder. Iterate and save new versions — never edit a live version. Target consistent, accurate output across varied inputs before connecting to an agent.', bullets: ['Zero-shot: instructions only, no examples', 'Few-shot: 2-5 input/output examples', 'Chain-of-thought: "think step by step"', 'Role prompting: set a persona at the top'] },
      { heading: 'Day 2 Exam Tips', content: 'This domain is 30% of the exam — highest weight! Key scenario types: "Which template type to use?" → know Field Gen vs Record Summary vs Flex. "Agent gives wrong answers" → improve grounding or add hallucination prevention instructions. "Sensitive data showing in output" → review data masking in Trust Layer. "User cannot run a prompt" → check Prompt Template User permission set.', bullets: ['Flex template = agent actions', 'Merge fields = CRM field values', 'RAG = large, changing knowledge bases', 'New versions = never edit live templates'] },
    ]
  },
  {
    num: 3,
    title: 'Agentforce Concepts & Architecture (30% of Exam)',
    subtitle: 'Topics, actions, channels, reasoning configuration, filters, variables — the core exam domain',
    time: '4h', examWeight: '30%', color: '#4A3FB0', bgColor: '#EEEDFE',
    helpLinks: [
      { title: 'Customize Agents with Topics and Actions', url: 'https://help.salesforce.com/s/articleView?id=ai.copilot_topics_actions.htm&type=5' },
      { title: 'Agent Actions Reference', url: 'https://help.salesforce.com/s/articleView?id=ai.copilot_actions.htm&type=5' },
      { title: 'Standard Agent Action Reference', url: 'https://help.salesforce.com/s/articleView?id=ai.copilot_actions_ref.htm&type=5' },
      { title: 'Topics in the Legacy Builder', url: 'https://help.salesforce.com/s/articleView?id=ai.copilot_topics.htm&type=5' },
    ],
    trailheads: [
      { name: 'Quick Start: Build Your First Agentforce Agent', type: 'Project', url: 'https://trailhead.salesforce.com/content/learn/projects/quick-start-build-your-first-agent-with-agentforce', icon: 'utility:connected_apps' },
      { name: 'Agentforce Service Agent Quick Look', type: 'Module', url: 'https://trailhead.salesforce.com/content/learn/modules/agentforce-service-agent-quick-look', icon: 'utility:education' },
      { name: 'Cert Prep: Agentforce Concepts Unit', type: 'Module', url: 'https://trailhead.salesforce.com/content/learn/modules/cert-prep-agentforce-specialist/review-agentforce-concepts', icon: 'utility:check' },
    ],
    topics: [
      {
        text: 'Topics & Actions',
        sub: 'Standard vs custom topics, action types, scope and instructions',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.copilot_topics_actions.htm&type=5',
        details: [
          { heading: 'Topics', text: 'A Topic is a cluster of related user intents the agent handles. Key fields: Name, Description (used by Atlas to match user intent — CRITICAL), Instructions (step-by-step guidance for the agent within this topic), and associated Actions. Standard topics (General FAQ, Escalation) come pre-built. Custom topics serve specific business needs.' },
          { heading: 'Actions', text: 'Actions are the tools an agent uses. Types: Standard Actions (Query Records, Create Record, Send Email, Summarize Record — built by Salesforce), Flow Actions (trigger an autolaunched flow), Apex Actions (@InvocableMethod), Prompt Actions (run a Prompt Builder Flex template), API Actions (call external REST APIs).' },
          { heading: 'Critical: Topic Description Quality', text: 'The Topic Description is what Atlas reads to decide which topic to activate. Vague or overlapping descriptions cause wrong topic activation. Write specific, unique, unambiguous descriptions. If two topics share similar descriptions, use exclusion language: "...but NOT for billing inquiries."' },
        ]
      },
      {
        text: 'Agent Builder Configuration',
        sub: 'Company context, system prompts, activation steps, agent versioning',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.copilot_topics_actions.htm&type=5',
        details: [
          { heading: 'Agent Builder', text: 'Setup → Agentforce Agents → Open in Builder. Four panels: Agent Details (name, description, company context), Topics (add/remove topics), Preview (test in real time), Channels (deploy the agent). Always deactivate the agent before editing; reactivate after changes.' },
          { heading: 'Company Context', text: 'The Company Context (system prompt) applies to EVERY conversation — your company name, brand voice, what the agent can and cannot discuss, escalation rules, language. It is the highest-level configuration and overrides individual topic instructions if conflicting.' },
          { heading: 'Activation Checklist', text: '(1) Complete all required config fields. (2) Configure Einstein Service Agent User profile (Setup → Users). (3) Assign relevant permission sets. (4) Click Activate. (5) Deploy to a channel. New in 2025: Agent Versioning — create new versions to test changes safely without impacting the live production agent.' },
        ]
      },
      {
        text: 'Channels & Deployment',
        sub: 'Experience Cloud, email, Slack, messaging — deploying agents to users',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.copilot_considerations.htm&type=5',
        details: [
          { heading: 'Available Channels', text: 'Experience Cloud (web chat on customer portals), Email (autonomous email responses), Slack (employee-facing agents), SMS/WhatsApp via Messaging for In-App and Web (MIAW), Custom channels via Agent API. Each channel requires separate configuration.' },
          { heading: 'Experience Cloud Deployment', text: 'Most common in exam: (1) Create/open Experience Cloud site in Experience Builder. (2) Add Messaging component. (3) In Agent Builder → Channels → select your site. (4) Publish the site. The agent user must have access to the Experience Cloud site and all queried objects.' },
          { heading: 'Escalation Best Practice', text: 'Always include the Escalation standard topic. It transfers the conversation to an Omni-Channel queue with the full transcript preserved — so humans don\'t ask customers to repeat themselves. This is a Salesforce best practice and an exam-tested scenario.' },
        ]
      },
      {
        text: 'Filters & Variables',
        sub: 'Deterministic agent behavior, topic/action filters, conversation variables',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.copilot_topics.htm&type=5',
        details: [
          { heading: 'Agent Variables', text: 'Variables store context across a conversation. System Variables (auto-populated: userId, orgId, conversationId). Custom Variables (admin-defined: store verified customer ID, selected product, etc.). Access in instructions using {!variable.name} syntax.' },
          { heading: 'Topic & Action Filters', text: 'Filters (GA March 2025): control when a topic or action is available based on conditions. Example: "Only activate Manage Orders if user is verified." Adds deterministic governance over the reasoning engine — critical for compliance or sensitive actions.' },
          { heading: 'When to Use Filters', text: 'Use filters when: an action involves sensitive data (payment info, account numbers), the action should only run in specific contexts (business hours, specific product lines), or compliance requires restricted access. This is an increasingly exam-tested concept.' },
        ]
      },
    ],
    usecase: {
      text: 'Build a complete Service Agent from scratch in Agent Builder.',
      steps: [
        'Setup → Agentforce Agents → New Agent → Agentforce Service Agent template',
        'Update the Company Context with a fictional company persona, brand voice, and what NOT to discuss',
        'Remove all default topics. Create custom topic: "Order Status Inquiry" with unique description',
        'Add 3 instructions to the topic. Add a standard Query Records action.',
        'Test in the Preview panel with 10 varied queries — observe how Atlas selects topics',
        'Add the standard Escalation topic and test a query that forces escalation',
      ]
    },
    studyDoc: [
      { heading: 'Topics: The Core Configuration Unit', content: 'A Topic defines a scope of work for the agent. It has a Name, a Description (used by Atlas to match user intent), Instructions (how the agent should behave within this topic), and Actions (tools the agent uses). Writing clear, distinctive Topic descriptions is the single most impactful configuration skill.' },
      { heading: 'Action Types', content: 'Five types of agent actions available in Agentforce:', bullets: ['Standard Actions: pre-built by Salesforce (Query Records, Create Record, Send Email, Summarize Record)', 'Flow Actions: trigger an autolaunched Salesforce Flow', 'Apex Actions: call a class with @InvocableMethod annotation', 'Prompt Actions: run a Prompt Builder Flex template', 'API Actions: call an external REST API endpoint'] },
      { heading: 'Company Context (System Prompt)', content: 'The Company Context is the master instruction set for the agent. It applies to every conversation and cannot be overridden by individual topic instructions. Include: company name, what the agent is, what it can and cannot help with, tone/voice, escalation rules, and any compliance requirements.' },
      { heading: 'Channels', content: 'Deploy agents to: Experience Cloud (customer web chat), Email (autonomous email handling), Slack (employee agents), SMS/WhatsApp (MIAW), or custom apps (Agent API). Always configure the Escalation topic to route unresolved conversations to Omni-Channel queues with full transcript context.' },
      { heading: 'Day 3 Key Exam Tips', content: 'This is tied for the highest exam weight (30%). Key scenario types: "Agent routing to wrong topic" → fix Topic description. "Agent not calling the right action" → improve action instructions within the topic. "Sensitive data exposed to wrong users" → add topic/action filters. "Employee needs internal support via Slack" → Employee Agent, not Service Agent.', bullets: ['Topic description = routing key for Atlas', 'Company Context = highest-priority instructions', 'Always add Escalation topic', 'Filters = deterministic access control'] },
    ]
  },
  {
    num: 4,
    title: 'Agentforce for Service & Sales',
    subtitle: 'Configure agents for real CRM use cases across Service Cloud and Sales Cloud',
    time: '4h', examWeight: null, color: '#0C6E4E', bgColor: '#E3F7EE',
    helpLinks: [
      { title: 'Agentforce Service Agent Actions', url: 'https://help.salesforce.com/s/articleView?id=ai.copilot_actions_ref_agentforce_service_agent.htm&type=5' },
      { title: 'Answer Questions with Knowledge', url: 'https://help.salesforce.com/s/articleView?id=ai.copilot_actions_ref_answer_questions_with_knowledge.htm&type=5' },
      { title: 'Agentforce Standard Asset Reference', url: 'https://help.salesforce.com/s/articleView?id=ai.copilot_ref.htm&type=5' },
      { title: 'Standard Agent Action Reference', url: 'https://help.salesforce.com/s/articleView?id=ai.copilot_actions_ref.htm&type=5' },
    ],
    trailheads: [
      { name: 'Agentforce Service Agent Quick Look', type: 'Module', url: 'https://trailhead.salesforce.com/content/learn/modules/agentforce-service-agent-quick-look', icon: 'utility:service_cloud' },
      { name: 'Configure Agentforce for Exceptional Service', type: 'Project', url: 'https://trailhead.salesforce.com/content/learn/projects/quick-start-build-your-first-agent-with-agentforce/configure-an-agentforce-service-agent', icon: 'utility:connected_apps' },
      { name: 'Agentforce for Sales', type: 'Module', url: 'https://trailhead.salesforce.com/content/learn/modules/agentforce-for-sales', icon: 'utility:salesforce1' },
    ],
    topics: [
      {
        text: 'Agentforce for Service',
        sub: 'Case deflection, knowledge grounding, escalation, 24/7 self-service',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.copilot_actions_ref_agentforce_service_agent.htm&type=5',
        details: [
          { heading: 'Core Capabilities', text: 'Agentforce for Service handles customer inquiries 24/7. Key capabilities: Case deflection (resolve before a case is created), Knowledge article surfacing (ground responses in your KB), Order and account lookups, Appointment scheduling, Escalation to human agents with full transcript. Unlike Einstein Bots (rule-based), Agentforce uses generative AI for natural responses.' },
          { heading: 'vs. Einstein Bots', text: 'Choose Einstein Bots when: strict compliance is required, you need fully deterministic conversation flows with specific dialogs and intents, or when the industry requires explainable AI processes. Choose Agentforce when: natural language flexibility is needed, complex reasoning is required, 24/7 scale is a priority. The exam will present both and ask you to choose.' },
          { heading: 'Setup Steps', text: 'Enable via Setup → Salesforce Go → search "Agentforce (Default)" → Get Started → Turn On. Configure Einstein Service Agent User profile. Create agent from template. Add knowledge-grounded topics. Deploy to Experience Cloud. Configure Omni-Channel for escalation routing.' },
        ]
      },
      {
        text: 'Agentforce Sales Agent (SDR)',
        sub: 'Prospect engagement, lead qualification, meeting scheduling',
        docUrl: 'https://trailhead.salesforce.com/content/learn/modules/agentforce-for-sales',
        details: [
          { heading: 'What the SDR Agent Does', text: 'The Sales Development Representative Agent handles top-of-funnel sales tasks autonomously: engages inbound leads via email, qualifies prospects with discovery questions, answers product/pricing FAQs, and schedules meetings into rep calendars. Works within Sales Cloud CRM data for personalization.' },
          { heading: 'Key Integrations', text: 'Einstein for Sales (email generation/tracking), Salesforce Calendar (meeting scheduling), Lead and Opportunity objects (CRM grounding), Prompt Builder (personalizing outreach emails). Hands off qualified leads to human reps with full AI-driven conversation history.' },
          { heading: 'Sales Coach Agent', text: 'Separate from SDR: Sales Coach provides real-time guidance to reps during calls — suggests talk tracks, surfaces battle cards, helps handle objections. Augments humans during the conversation; SDR replaces repetitive outbound tasks. Both are valid "Sales Agent" types in the exam.' },
        ]
      },
      {
        text: 'Employee Agent',
        sub: 'Internal helpdesk, HR queries, IT support, Slack deployment',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.copilot_ref.htm&type=5',
        details: [
          { heading: 'Use Cases', text: 'Employee Agents handle internal support: HR queries (PTO, benefits, onboarding), IT helpdesk (password resets, software requests, ticket routing), Policy lookups (expense policy, code of conduct), Facilities (room bookings, equipment). Deployed via Slack or internal Experience Cloud portals.' },
          { heading: 'Key Differences', text: 'Employee Agents use internal data sources. They typically have stricter access controls as they may surface sensitive employee data. Slack is the most common deployment channel. The agent user must be a Salesforce user (internal users, not Experience Cloud guests).' },
          { heading: 'Exam Scenario', text: 'Customer-facing 24/7 support → Service Agent. Outbound/inbound prospect engagement → Sales SDR Agent. Internal employee support via Slack → Employee Agent. Hybrid scenario (both employee AND customer) = trick question — you need TWO separate agents, not one.' },
        ]
      },
      {
        text: 'Escalation & Graceful Degradation',
        sub: 'Always-on escalation, Omni-Channel routing, transcript preservation',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.copilot_actions_ref_agentforce_service_agent.htm&type=5',
        details: [
          { heading: 'Why Escalation Matters', text: 'No agent resolves 100% of inquiries. A missing escalation path traps customers in an unresolved AI loop. Best practice: always include the standard Escalation topic in every customer-facing agent. It transfers the conversation to Omni-Channel with the full transcript so humans have context.' },
          { heading: 'Graceful Degradation', text: 'Configure the agent to respond gracefully when it cannot answer: "I don\'t have that information, but I can connect you with a specialist." Add this instruction to the Company Context and Escalation topic. Agents that clearly say "I don\'t know" are better than agents that hallucinate wrong answers — and this is a tested exam principle.' },
        ]
      },
    ],
    usecase: {
      text: 'Configure a knowledge-grounded Service Agent for an e-commerce company.',
      steps: [
        'Enable Agentforce via Setup → Salesforce Go → Agentforce (Default) → Turn On',
        'Confirm the Einstein Service Agent User profile is configured in Setup → Users',
        'Create a new agent from the Service Agent template; remove all default topics except Escalation',
        'Add topic "Return Policy" — write a unique description; add the Answer Questions with Knowledge action',
        'Deploy to an Experience Cloud site and test 10 varied return-related queries',
        'Observe how the agent escalates when it cannot answer; verify transcript is visible to human agent',
      ]
    },
    studyDoc: [
      { heading: 'Agentforce for Service vs Einstein Bots', content: 'Einstein Bots: rule-based, declarative dialogs, deterministic, explainable, better for regulated industries requiring specific conversation flows. Agentforce Service Agent: generative AI, natural language, flexible, requires good prompt/topic configuration. Choose Agentforce for flexibility and scale; choose Einstein Bots for strict compliance and determinism.' },
      { heading: 'Agent Types Decision Guide', content: 'Use this framework for exam scenarios:', bullets: ['External customer support, case deflection, 24/7 → Service Agent on Experience Cloud or MIAW', 'Outbound lead engagement, meeting scheduling, email → Sales SDR Agent in Sales Cloud', 'Internal employee HR/IT support → Employee Agent on Slack or internal portal', 'Real-time coaching during sales calls → Sales Coach Agent (not SDR)', 'Both internal AND external use → Two separate agents'] },
      { heading: 'Service Agent Setup Checklist', content: 'Enable Agentforce (Setup → Salesforce Go). Configure Einstein Service Agent User profile. Create agent from template. Configure Company Context. Add custom topics with clear descriptions. Add relevant actions (knowledge, flows, Apex). Configure Escalation topic. Assign permission sets to agent user. Deploy to channel. Test with diverse queries.' },
      { heading: 'Escalation Topic', content: 'The Escalation topic is a standard topic provided by Salesforce. It routes unresolved conversations to an Omni-Channel queue. Best practice: always include it. The full conversation transcript is transferred with the escalation so human agents have context. Configure the escalation message shown to customers.' },
      { heading: 'Day 4 Key Exam Tips', content: 'Common exam trick: "A company needs one agent to handle customers AND employees." Wrong — you need two separate agents. "An agent gives wrong answers to knowledge questions." → Ensure the Answer Questions with Knowledge action is attached to the topic and the knowledge base is correctly configured.', bullets: ['Always include Escalation topic', 'Einstein Bots = deterministic; Agentforce = generative', 'Employee vs Service agent = audience determines the type', 'Sales SDR = prospect outreach; Sales Coach = rep support'] },
    ]
  },
  {
    num: 5,
    title: 'Data 360 (Data Cloud) for Agentforce (20% of Exam)',
    subtitle: 'Unified profiles, Agentforce Data Library, RAG, custom retrievers, and grounding agents with real data',
    time: '4h', examWeight: '20%', color: '#0F5CA3', bgColor: '#E3EFFE',
    helpLinks: [
      { title: 'Data Cloud for Agentforce Overview', url: 'https://help.salesforce.com/s/articleView?id=ai.agentforce_data_library_overview.htm&type=5' },
      { title: 'Agentforce Data Library', url: 'https://help.salesforce.com/s/articleView?id=ai.agentforce_data_library.htm&type=5' },
      { title: 'Connect Data Cloud to Agentforce', url: 'https://trailhead.salesforce.com/content/learn/projects/connect-data-cloud-to-copilot-and-prompt-builder' },
      { title: 'Data Cloud Overview (Salesforce Help)', url: 'https://help.salesforce.com/s/articleView?id=sf.c360_a_data_cloud_overview.htm&type=5' },
    ],
    trailheads: [
      { name: 'Get Started with Data 360 and AI', type: 'Project', url: 'https://trailhead.salesforce.com/content/learn/projects/connect-data-cloud-to-copilot-and-prompt-builder', icon: 'utility:database' },
      { name: 'Implementing Data Cloud for Agentforce', type: 'Module', url: 'https://trailhead.salesforce.com/content/learn/modules/data-cloud-powered-agentforce', icon: 'utility:education' },
      { name: 'Cert Prep: Data Cloud for Agentforce', type: 'Module', url: 'https://trailhead.salesforce.com/content/learn/modules/cert-prep-agentforce-specialist/review-data-cloud-for-agentforce', icon: 'utility:check' },
    ],
    topics: [
      {
        text: 'Data 360 Fundamentals',
        sub: 'DMOs, unified profiles, enabling vs. implementing, data streams',
        docUrl: 'https://help.salesforce.com/s/articleView?id=sf.c360_a_data_cloud_overview.htm&type=5',
        details: [
          { heading: 'What is Data 360?', text: 'Data 360 (formerly Data Cloud) is Salesforce\'s real-time data platform. It ingests data from multiple sources, creates Unified Profiles merging contact data across systems, and gives agents the richest data foundation for personalized, contextual responses.' },
          { heading: 'Enabling vs. Implementing', text: 'Enabling Data 360: activates the license, unlocks Trust Layer, enables basic Agentforce capabilities. No data setup needed. Implementing Data 360: connecting data streams, creating Data Model Objects (DMOs), running identity resolution to create Unified Profiles, and building custom retrievers. Full implementation required for advanced RAG.' },
          { heading: 'Key Concepts', text: 'Data Streams: connections that ingest source data. Data Model Objects (DMOs): unified schema mapping source fields to standard Data 360 fields. Unified Profiles: a single merged view of a person across all data sources. Identity Resolution: process that merges duplicate profiles from multiple systems.' },
        ]
      },
      {
        text: 'Agentforce Data Library',
        sub: 'Custom retrievers, web search libraries, chunking, indexing unstructured data',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.agentforce_data_library.htm&type=5',
        details: [
          { heading: 'What It Is', text: 'The Agentforce Data Library is the repository for RAG data sources. Two types: Custom Retriever Libraries (internal data: PDFs, knowledge articles, documents indexed in Einstein Studio), and Web Search Libraries (public web content for external knowledge). Libraries are attached to specific agents under Data Sources in Agent Builder.' },
          { heading: 'Chunking & Indexing', text: 'Documents are split into chunks (typically 512–1024 tokens). Each chunk is converted to a vector embedding and stored in an index. At query time, the user\'s question is vectorized and matched against the index to find the most semantically similar chunks — these are injected into the prompt as context.' },
          { heading: 'Custom Retrievers', text: 'Configure in Einstein Studio: select data source (Data 360 DMO or file upload), choose fields to index, set filters (e.g., only index docs tagged "Product"), choose search type. Hybrid search (keyword + semantic) produces the best results for enterprise knowledge bases.' },
        ]
      },
      {
        text: 'RAG with Data 360',
        sub: 'Retrieval-augmented generation, grounding prompts, standard vs. advanced RAG',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.agentforce_data_library_overview.htm&type=5',
        details: [
          { heading: 'RAG Flow', text: '(1) User sends a query. (2) Atlas converts the query to a vector. (3) Most relevant document chunks are retrieved from the Data Library index. (4) Chunks are injected into the prompt as context. (5) LLM generates a grounded response. (6) Trust Layer reviews the output. (7) Response sent to user.' },
          { heading: 'Standard vs. Advanced RAG', text: 'Standard RAG (no full Data 360 implementation): uses Data Library with file uploads and knowledge articles. Advanced RAG (requires full Data 360): uses unified profiles for personalization, real-time CRM data, and custom retrievers with complex filtering. Enables "Based on your purchase history..." responses — impossible with standard RAG alone.' },
          { heading: 'Exam Focus', text: 'RAG requires Agentforce Data Library. General FAQ topic = basic grounding. General Web Search topic = requires web search library AND removing General FAQ topic first. Data 360 retrievers support diverse data types. Enabling Data 360 is not the same as implementing it.' },
        ]
      },
      {
        text: 'Analytics & Optimization',
        sub: 'Agentforce Observability, session metrics, conversation logs in Data 360',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.agentforce_data_library_overview.htm&type=5',
        details: [
          { heading: 'Observability', text: 'Agentforce Observability (GA Nov 2025): Total sessions, Deflected sessions (resolved by AI without human — target 60%+), Escalated sessions, Average latency per turn, Topic activation frequency, Action success/failure rates. All conversation logs stored in Data 360 for analysis.' },
          { heading: 'Improvement Loop', text: 'Low deflection → review failing topics, improve instructions or add actions. High escalation → check escalation trigger settings. High latency → simplify retrievers, reduce data sources. Topic mismatch → improve topic descriptions.' },
        ]
      },
    ],
    usecase: {
      text: 'Complete the Trailhead Data 360 + Agentforce project in a playground org.',
      steps: [
        'Sign up for the Trailhead Data 360 + Agentforce playground org (separate from your Dev org)',
        'Complete the "Get Started with Data 360 and AI" project on Trailhead',
        'In Einstein Studio, explore the retriever configuration options',
        'Create a Data Library using the retriever and attach it to a test agent',
        'Test queries that should pull from the Data Library vs. queries that should not',
        'Review the difference in response quality between grounded and ungrounded answers',
      ]
    },
    studyDoc: [
      { heading: 'Data 360 for Agentforce: Why It Matters', content: 'Without Data 360, agents can only access data via CRM queries (standard actions) or static merge fields. With Data 360, agents have access to: unified customer profiles (merged from multiple systems), unstructured documents (PDFs, knowledge articles, FAQs) via RAG, and real-time external data. This enables significantly more personalized and accurate responses.' },
      { heading: 'Agentforce Data Library', content: 'The Data Library is where you configure what data the agent can retrieve at runtime. Two types:', bullets: ['Custom Retriever Library: internal data indexed in Einstein Studio — PDFs, knowledge articles, DMO fields', 'Web Search Library: public web content — requires removing General FAQ topic and adding General Web Search topic'] },
      { heading: 'RAG Process (Simplified)', content: 'User sends query → Atlas converts to vector → Data Library index is searched for similar vectors → Top-N matching chunks retrieved → Chunks injected into prompt as context → LLM generates grounded response → Trust Layer reviews → Response sent to user. The quality of chunking, indexing, and retriever configuration directly determines response accuracy.' },
      { heading: 'Enabling vs. Implementing Data 360', content: 'Enabling: activate the license → Trust Layer is active, basic Agentforce works. No data setup needed. Implementing: configure data streams → create DMOs → run identity resolution → build unified profiles → create custom retrievers → build Data Library → attach to agent. Full implementation required for advanced RAG and personalized responses.' },
      { heading: 'Day 5 Exam Tips', content: 'This domain is 20% of the exam. Common scenario: "Agent gives generic responses not based on company data." → Implement RAG with Agentforce Data Library. "Agent needs to surface web content." → Add Web Search library AND remove General FAQ topic. "Agent responses lack customer personalization." → Implement Data 360 with unified profiles.', bullets: ['Enabling ≠ Implementing Data 360', 'Web Search library requires removing General FAQ topic', 'Chunking + indexing = automatic, you configure the strategy', 'Advanced RAG needs full Data 360 implementation'] },
    ]
  },
  {
    num: 6,
    title: 'Flows & Apex as Agent Actions',
    subtitle: 'Build agent-ready flows, register them as actions, write @InvocableMethod Apex, action description best practices',
    time: '4h', examWeight: null, color: '#8C3210', bgColor: '#FAECE7',
    helpLinks: [
      { title: 'Create a Flow-Based Agent Action', url: 'https://help.salesforce.com/s/articleView?id=ai.agentforce_add_flow_action.htm&type=5' },
      { title: 'Create an Apex-Based Agent Action', url: 'https://help.salesforce.com/s/articleView?id=ai.agentforce_add_apex_action.htm&type=5' },
      { title: 'Agent Actions (Full Reference)', url: 'https://help.salesforce.com/s/articleView?id=ai.copilot_actions.htm&type=5' },
      { title: 'Agentforce Standard Asset Reference', url: 'https://help.salesforce.com/s/articleView?id=ai.copilot_ref.htm&type=5' },
    ],
    trailheads: [
      { name: 'Custom Service Agents with Prompt Builder', type: 'Module', url: 'https://trailhead.salesforce.com/content/learn/modules/custom-service-agents-with-prompt-builder-and-agentforce', icon: 'utility:education' },
      { name: 'Enhance Agentforce with Flow Actions', type: 'Project', url: 'https://trailhead.salesforce.com/content/learn/projects/connect-data-cloud-to-copilot-and-prompt-builder/enhance-copilot-to-act-on-data-with-conversational-language', icon: 'utility:flow' },
      { name: 'Get Started with Agentforce (Build Flow Actions)', type: 'Trail', url: 'https://trailhead.salesforce.com/content/learn/trails/get-ready-for-agentforce', icon: 'utility:trail' },
    ],
    topics: [
      {
        text: 'Agent-Ready Flows',
        sub: 'Autolaunched flows, input/output variables, fault paths, descriptions',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.agentforce_add_flow_action.htm&type=5',
        details: [
          { heading: 'Requirements', text: 'An agent-ready flow is an Autolaunched Flow (No Trigger). Key requirements: (1) A clear, detailed description at the flow level — placed in Action Instructions by Agentforce. (2) Well-described input and output variables. (3) Fault paths on all error-prone elements. (4) Clean, structured output the agent can read.' },
          { heading: 'Variable Best Practices', text: 'Input variables: "Available for input", with descriptions like "The Salesforce ID of the Contact whose open cases should be retrieved." Output variables: "Available for output" with format description. Limit variables to what the agent actually needs — extra unused variables confuse Atlas.' },
          { heading: 'Fault Paths', text: 'Every Get Records, HTTP Callout, or DML element can fail. Add fault connectors that set a descriptive error output variable (e.g., "No cases found for this contact."). Without fault paths, action failure crashes the agent conversation with no user-friendly message.' },
        ]
      },
      {
        text: 'Registering Actions in Agentforce Assets',
        sub: 'Setup → Agentforce Assets, action configuration, show loading text',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.agentforce_add_flow_action.htm&type=5',
        details: [
          { heading: 'Steps', text: '(1) Setup → Agentforce Assets → Actions tab → New Agent Action. (2) Reference Action Type: Flow. (3) Select your flow. (4) Review auto-populated Action Instructions from flow description — enhance if needed. (5) Configure each variable: mark required inputs, "Show in conversation" for user-facing outputs. (6) Click Finish.' },
          { heading: 'Show Loading Text', text: 'For long-running flows (>2 seconds), enable "Show loading text" and customize (e.g., "Looking up your order details..."). For quick lookups, disable to reduce message noise.' },
          { heading: 'Attaching to Topics', text: 'After registering: Agent Builder → your topic → Actions → Add Action → select the action. Add action-level instructions: "Call this action when the user asks about a specific order and provides an order number." Without these instructions, Atlas may call the action at wrong times.' },
        ]
      },
      {
        text: 'Apex as Agent Action',
        sub: '@InvocableMethod, parameter annotations, when Apex beats Flow',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.agentforce_add_apex_action.htm&type=5',
        details: [
          { heading: 'When to Use Apex vs. Flow', text: 'Flow: CRUD operations, simple queries, email sending, task creation — declarative, easier to maintain. Apex: complex logic, HTTP callouts, advanced calculations, string manipulation, data transformations beyond Flow capabilities.' },
          { heading: '@InvocableMethod Pattern', text: 'Requirements: public static method, @InvocableMethod(label=\'...\' description=\'...\') annotation, accepts List<Request>, returns List<Result>. Input fields: @InvocableVariable(label=\'...\' description=\'...\' required=true/false). The label and description in annotations appear in Agentforce — write them clearly.' },
          { heading: 'Example', text: 'public class GetOpenCasesAction { @InvocableMethod(label=\'Get Open Cases\' description=\'Retrieves open Cases for a Contact by their Salesforce Contact ID\') public static List<Result> execute(List<Request> reqs) {...} public class Request { @InvocableVariable(required=true) public Id contactId; } public class Result { @InvocableVariable public String casesSummary; } }' },
        ]
      },
      {
        text: 'Action Description Best Practices',
        sub: 'Why descriptions drive Atlas action selection and input/output handling',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.copilot_actions.htm&type=5',
        details: [
          { heading: 'Why Descriptions Matter', text: 'Atlas reads action descriptions to decide: should I call this action? What data to pass as inputs? How to present outputs? A vague description like "Gets cases" → Atlas misuses the action. A specific description like "Retrieves all open Cases for a given Contact ID, returning case numbers, subjects, and creation dates" → Atlas uses it correctly every time.' },
          { heading: 'Writing Rules', text: 'Include: what the action does, what input it needs (be specific about format and type), what output it returns, when NOT to call it. Avoid: vague verbs ("handles", "manages"), jargon, descriptions over 200 words. Write for an AI reader, not a human developer.' },
        ]
      },
    ],
    usecase: {
      text: 'Build a Flow-based and Apex-based agent action and register both.',
      steps: [
        'Build autolaunched flow "Get Open Cases for Contact" — input: Contact Id, output: formatted case list string',
        'Add @description to the flow and clear descriptions to all variables',
        'Register the flow as an agent action in Setup → Agentforce Assets → Actions',
        'Create Apex class GetProductRecommendationsAction with @InvocableMethod — returns product suggestions based on category',
        'Register the Apex action in Agentforce Assets with clear action instructions',
        'Add both actions to relevant topics in your Day 3 agent and test in Preview panel',
      ]
    },
    studyDoc: [
      { heading: 'Agent-Ready Flow Requirements', content: 'Not every flow can be used as an agent action. Requirements: Autolaunched Flow (No Trigger). A descriptive flow-level description (auto-copied to Action Instructions). Input variables marked "Available for input" with clear descriptions. Output variables marked "Available for output" with format descriptions. Fault paths on all error-prone elements (Get Records, DML, Callouts).' },
      { heading: 'Registering Actions', content: 'All agent actions are registered in Setup → Agentforce Assets → Actions tab. Steps: New Agent Action → choose Reference Action Type (Flow, Apex, Prompt Template, or External Service) → select the specific asset → Salesforce auto-populates Instructions from descriptions → configure input/output settings → Finish. Then add to a topic in Agent Builder.' },
      { heading: 'Apex @InvocableMethod', content: 'Apex actions must use the @InvocableMethod annotation. The label and description in the annotation are used directly by Agentforce for action instructions. Input and output parameter classes use @InvocableVariable annotations. Always return a List — even if only one result. The method must be public static.' },
      { heading: 'Action Descriptions: The Most Overlooked Config', content: 'Atlas uses action descriptions to decide WHEN to call an action and HOW to use it. Poor description → wrong action called or correct action called incorrectly. Best description structure: "Retrieves/Creates/Updates [what] for [who] given [what input], returning [what output format]." Example: "Retrieves all open Cases for a given Contact ID, returning a formatted list of case numbers, subjects, and creation dates as a single string."' },
      { heading: 'Day 6 Key Exam Tips', content: 'Common exam scenario: "Agent calls the wrong action" → improve action description and action-level instructions within the topic. "Agent action fails with no user message" → add fault paths to the flow. "Agent cannot create records" → agents can only read by default — Flow or Apex action required for DML operations.', bullets: ['Autolaunched flow = only flow type for agent actions', 'Flow description → auto-populated action instructions', 'Fault paths = user-friendly error handling', '@InvocableMethod description = action instructions source'] },
    ]
  },
  {
    num: 7,
    title: 'Security, Testing & Deployment Lifecycle (20% of Exam)',
    subtitle: 'Agent User security, Testing Center, deploying from sandbox to production, agent versioning, and monitoring',
    time: '4h', examWeight: '20%', color: '#8C2451', bgColor: '#FAEBF3',
    helpLinks: [
      { title: 'Agentforce Testing Center', url: 'https://help.salesforce.com/s/articleView?id=ai.agentforce_testing_center.htm&type=5' },
      { title: 'Deploy an Agentforce Agent', url: 'https://help.salesforce.com/s/articleView?id=ai.agentforce_deploy.htm&type=5' },
      { title: 'Agentforce Security', url: 'https://help.salesforce.com/s/articleView?id=ai.copilot_security.htm&type=5' },
      { title: 'Control Access with Filters', url: 'https://help.salesforce.com/s/articleView?id=ai.agentforce_filters.htm&type=5' },
    ],
    trailheads: [
      { name: 'Update Agentforce Concepts for Certification', type: 'Module', url: 'https://trailhead.salesforce.com/content/learn/modules/agentforce-specialist-certification-maintenance-summer-25/get-up-to-date-on-agentforce-concepts', icon: 'utility:education' },
      { name: 'Cert Prep: Deployment Lifecycle Unit', type: 'Module', url: 'https://trailhead.salesforce.com/content/learn/modules/cert-prep-agentforce-specialist/review-the-agentforce-deployment-lifecycle', icon: 'utility:check' },
      { name: 'Cert Prep: Agentforce Specialist', type: 'Module', url: 'https://trailhead.salesforce.com/content/learn/modules/cert-prep-agentforce-specialist', icon: 'utility:ribbon' },
    ],
    topics: [
      {
        text: 'Agentforce Security Model',
        sub: 'Agent User profile, Einstein Service Agent User, permission sets',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.copilot_security.htm&type=5',
        details: [
          { heading: 'Agent User Profile', text: 'Every Agentforce agent runs as a named Agent User. This user\'s profile controls what objects and fields the agent can access. Key profile: Einstein Service Agent User — the standard profile for Service Agents. Create custom profiles for agents that need different access levels. Always follow least privilege — agents should only access what they need.' },
          { heading: 'Permission Sets', text: 'Assign permission sets to the agent user for: Prompt Builder template access (Prompt Template User), object/field access, connected app access (for external API actions), Einstein features. Review these carefully — missing permission sets are a common reason agents fail to call actions in production.' },
          { heading: 'Customer Verification Topic', text: 'Protects sensitive actions. When a user tries to access a protected topic/action, the agent triggers a verification flow (requesting email, username, etc.). Example: protect "Cancel Subscription" or "View Payment Details" behind customer verification. Configured in Agent Builder → Topics → Customer Verification.' },
        ]
      },
      {
        text: 'Agentforce Testing Center',
        sub: 'Test suites, test cases, expected outcomes, pass/fail thresholds',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.agentforce_testing_center.htm&type=5',
        details: [
          { heading: 'What It Is', text: 'The Agentforce Testing Center (Agent Builder → Test tab) is the built-in automated testing tool. Create Test Suites containing multiple Test Cases. Each test case defines: input message, expected outcome (which topic activates, which action runs, what the response should contain), and an acceptance threshold (% of runs that must pass).' },
          { heading: 'Test Coverage Strategy', text: '(1) Happy path: normal queries that succeed. (2) Edge cases: missing info, typos, unusual phrasing. (3) Out-of-scope: questions the agent should NOT answer. (4) Sensitive queries: attempts to access protected actions without verification. (5) Escalation triggers: queries that should route to a human. Aim for >80% pass rate before production.' },
          { heading: 'Interpreting Results', text: 'For each test: which topic activated, which action was called, actual response, pass/fail. Failures indicate: wrong topic matched (fix topic description), wrong action called (fix action instructions), response quality issue (fix topic instructions or prompt template). Re-run after every major change.' },
        ]
      },
      {
        text: 'Sandbox to Production Deployment',
        sub: 'Change Sets, Salesforce CLI, metadata types, pre-deploy checklist',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.agentforce_deploy.htm&type=5',
        details: [
          { heading: 'Deployment Options', text: 'Change Sets (admin-friendly, no code), Salesforce CLI: sf project deploy start (developer, supports CI/CD), Unlocked Packages (ISVs and complex deployments). Agentforce agent metadata includes: agent definition, topics, actions (flow/Apex references must also be deployed), prompt templates, permission set assignments.' },
          { heading: 'Pre-Deployment Checklist', text: '(1) Run full Testing Center suite in sandbox — achieve >80% pass rate. (2) Verify all dependent metadata exists in target org. (3) Confirm Agent User profile and permission sets are in target org. (4) Ensure Data Library config is replicated. (5) Plan timing (off-peak). (6) Have rollback plan ready.' },
          { heading: 'Agent Versioning', text: 'Agent versioning (GA 2025) lets you create new agent versions without affecting the live version. Use for: safe testing of config changes, staging new features, rollback capability. Managed in Agent Builder → agent Details page. Switch active version at any time without redeployment.' },
        ]
      },
      {
        text: 'Monitoring & Adoption',
        sub: 'Observability dashboards, session analytics, continuous improvement process',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.agentforce_testing_center.htm&type=5',
        details: [
          { heading: 'Post-Deploy Monitoring', text: 'Agentforce Observability dashboards: Total sessions, Deflection rate (% resolved by AI without escalation — target 60%+), Escalation rate, Average turns per conversation, Common failure topics. Review weekly in the first month post-launch.' },
          { heading: 'Improvement Cycle', text: 'Review conversation logs in Data 360 to identify: questions the agent fails to answer (→ new topics or improved actions), user abandonment points (→ simplify responses), recurring escalation triggers (→ decide if AI can handle or if human is always appropriate). This feedback loop is how agents improve over time.' },
        ]
      },
    ],
    usecase: {
      text: 'Build a Testing Center suite and create a deployment plan.',
      steps: [
        'Open Testing Center for your Day 3 Service Agent in Agent Builder',
        'Create Test Suite "Service Agent Regression Tests" with 10 test cases',
        'Cover: 3 happy path, 2 edge cases, 2 out-of-scope, 2 escalation, 1 security scenario',
        'Run the suite — identify any failures and fix related topic/action configurations',
        'Add Customer Verification to your most sensitive action (e.g., Cancel Order)',
        'Create a Change Set in sandbox and add the agent + all dependent metadata (flows, prompt templates)',
      ]
    },
    studyDoc: [
      { heading: 'Agent Security Model', content: 'Agentforce runs as an Agent User (a system user in your org). The Einstein Service Agent User is the standard profile — it has appropriate access for most service scenarios. Create custom profiles when the agent needs more restricted (or expanded) access. Assign permission sets for specific capabilities (prompt templates, external services). Always apply least privilege.' },
      { heading: 'Testing Center', content: 'Built into Agent Builder (Test tab). Create Test Suites with multiple Test Cases. Each test defines: input message, expected topic, expected action, expected response content, and pass threshold. Run suites to validate agent behavior before every production deployment. Target >80% pass rate.', bullets: ['Happy path tests: normal queries that should succeed', 'Edge case tests: unusual inputs, missing data, typos', 'Out-of-scope tests: questions the agent should NOT answer', 'Escalation tests: queries that should route to a human', 'Security tests: attempts to access protected actions without verification'] },
      { heading: 'Deployment Approach', content: 'Options: Change Sets (admin, no code), Salesforce CLI (developer, CI/CD friendly), Unlocked Packages (ISV). Always deploy in this order: (1) dependent metadata (flows, Apex, prompt templates), then (2) the agent definition. Verify permission sets and profiles exist in the target org before deploying.' },
      { heading: 'Agent Versioning', content: 'Create new agent versions to test changes without impacting the live production agent. Think of it like software version control: develop in a new version, test thoroughly, then switch the active version. You can roll back by switching back to a previous version at any time.' },
      { heading: 'Day 7 Exam Tips', content: 'This domain is 20% of the exam. Common scenarios: "Agent fails in production but works in sandbox" → check permission sets and profiles in production org. "Company wants to test new agent configuration without impacting customers" → use Agent Versioning. "How do you validate an agent before go-live?" → Testing Center with >80% pass rate.', bullets: ['Einstein Service Agent User = standard profile for service agents', 'Customer Verification = protects sensitive actions', 'Testing Center >80% = recommended before production deploy', 'Change Set = admin-friendly deployment option'] },
    ]
  },
  {
    num: 8,
    title: 'Monitoring, MCP, Agent APIs & Advanced Topics',
    subtitle: 'Observability, Model Context Protocol, Agent-to-Agent protocol, Agent API, and the new Agentforce Builder (GA Feb 2026)',
    time: '4h', examWeight: null, color: '#285C10', bgColor: '#EAF3DE',
    helpLinks: [
      { title: 'New Agentforce Builder (GA)', url: 'https://help.salesforce.com/s/articleView?id=ai.agentforce_new_builder.htm&type=5' },
      { title: 'Agentforce Developer Docs', url: 'https://developer.salesforce.com/docs/einstein/genai/guide/what-is-agentforce.html' },
      { title: 'Agent API Reference', url: 'https://developer.salesforce.com/docs/einstein/genai/guide/agent-api.html' },
      { title: 'Agentforce Observability', url: 'https://help.salesforce.com/s/articleView?id=ai.agentforce_observability.htm&type=5' },
    ],
    trailheads: [
      { name: 'New Agentforce & Data Cloud Features', type: 'Module', url: 'https://trailhead.salesforce.com/content/learn/modules/agentforce-specialist-certification-maintenance-summer-25/learn-whats-new-with-agentforce-and-data-cloud', icon: 'utility:new_window' },
      { name: 'Agentblazer Status (All Levels)', type: 'Trail', url: 'https://trailhead.salesforce.com/agentblazer', icon: 'utility:trail' },
      { name: 'Introduction to Agentforce', type: 'Module', url: 'https://trailhead.salesforce.com/content/learn/modules/introduction-to-agentforce', icon: 'utility:education' },
    ],
    topics: [
      {
        text: 'Model Context Protocol (MCP)',
        sub: 'Open standard for AI model-to-tool communication, Salesforce MCP support',
        docUrl: 'https://developer.salesforce.com/docs/einstein/genai/guide/what-is-agentforce.html',
        details: [
          { heading: 'What Is MCP?', text: 'MCP (Model Context Protocol) is an open standard (originally from Anthropic, now industry-wide) for AI models to communicate with external tools and data sources in a standardized way. In Agentforce, MCP lets agents connect to external systems (Jira, ServiceNow, SAP, custom databases) without building custom integrations for each.' },
          { heading: 'MCP in Salesforce', text: 'An external system exposes an MCP server with defined tools. The Agentforce agent connects to the MCP server and invokes those tools as agent actions. This enables agents to interact with non-Salesforce systems without full API integration code. MCP provides dynamic tool discovery — the agent can discover what tools are available.' },
          { heading: 'Exam Context', text: 'MCP is an open standard, not Salesforce-proprietary. It is useful for connecting legacy enterprise systems to Agentforce. Direct API actions require manual endpoint configuration; MCP provides standardized discovery. Know the difference and when each is appropriate.' },
        ]
      },
      {
        text: 'Agent API & Agent-to-Agent Protocol',
        sub: 'Programmatic invocation, multi-agent systems, orchestration',
        docUrl: 'https://developer.salesforce.com/docs/einstein/genai/guide/agent-api.html',
        details: [
          { heading: 'Agent API', text: 'The Agent API lets external systems invoke Agentforce agents via REST. Use when: embedding Agentforce in a non-Salesforce UI, calling an agent from a custom web/mobile app, triggering agent conversations from external events (webhooks). Authentication uses OAuth 2.0 connected apps.' },
          { heading: 'Agent-to-Agent Protocol', text: 'Enables multiple agents to collaborate — one orchestrator agent delegates tasks to specialist worker agents. Example: Orchestrator Sales Agent receives a complex request → delegates lead research to Research Agent → sends email via Outreach Agent → schedules meeting via Calendar Agent. Enables multi-agent systems for complex enterprise workflows.' },
          { heading: 'When to Use Agent API', text: 'Use when: you need Agentforce in a non-Salesforce UI, you have a custom mobile app, you want to trigger agent conversations from external events. Do not use when a standard Agentforce channel (Experience Cloud, Slack, email) already meets the need — always prefer built-in channels for simplicity.' },
        ]
      },
      {
        text: 'New Agentforce Builder (GA Feb 2026)',
        sub: 'Canvas UI, Agent Script language, hybrid reasoning engine, topic pass-through',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.agentforce_new_builder.htm&type=5',
        details: [
          { heading: 'What\'s New', text: 'The new Agentforce Builder (GA February 2026): Canvas View (visual no-code UI for topics and actions), Agent Script (new declarative code language for defining agents — enables version control), Hybrid Reasoning Engine (combines generative AI flexibility with deterministic control flows), Topic Pass-Through (chain actions across topics seamlessly).' },
          { heading: 'Agent Script', text: 'Developers can define agents as code (like YAML/JSON) in Agent Script. Benefits: version control in Git, code review, programmatic generation, easier org-to-org migration. Write in VS Code or the new Builder\'s Script View.' },
          { heading: 'Topic Pass-Through', text: 'Previously, if a user\'s request spanned two topics, the agent would complete one and restart fresh. With pass-through, context is carried across topic boundaries — enabling natural multi-step workflows without the user needing to re-state context.' },
        ]
      },
      {
        text: 'Agentforce Observability',
        sub: 'Session analytics, conversation logs, optimization recommendations',
        docUrl: 'https://help.salesforce.com/s/articleView?id=ai.agentforce_observability.htm&type=5',
        details: [
          { heading: 'Features', text: 'Observability (GA November 2025): Conversation Logs (full transcripts in Data 360), Session Metrics (total, deflection rate, escalation rate, avg latency), Topic Performance (which topics have high failure rates), Action Performance (success/failure rates), Optimization Recommendations (AI suggests instruction improvements from conversation patterns).' },
          { heading: 'Weekly Optimization Process', text: '(1) Check deflection rate — if below target, find failing topics. (2) Review conversation logs for those topics. (3) Identify common failure patterns. (4) Update topic instructions or add actions. (5) Re-test in Testing Center. (6) Deploy updated agent version. (7) Monitor for improvement.' },
        ]
      },
    ],
    usecase: {
      text: 'Explore Observability, Agent API docs, and the new Builder.',
      steps: [
        'Run 15+ test conversations with your agent in the Developer org using the Preview panel',
        'Open Agentforce Observability and review the session dashboard — note deflection and escalation rates',
        'Find one poor-quality conversation in the logs and identify WHY the agent failed',
        'Update the relevant topic instruction based on what you learned; re-test',
        'Read the Agent API developer docs at developer.salesforce.com/docs/einstein/genai/guide/agent-api',
        'Explore the new Agentforce Builder Canvas view in your org (if available)',
      ]
    },
    studyDoc: [
      { heading: 'Model Context Protocol (MCP)', content: 'MCP is an open, vendor-neutral standard for AI models to communicate with external tools and data sources. In Salesforce, it enables Agentforce agents to connect to non-Salesforce systems without building custom integrations. External systems expose an MCP server; the agent discovers and calls tools on that server as agent actions. Key advantage over direct API actions: dynamic tool discovery.' },
      { heading: 'Agent API', content: 'The Agent API enables external systems to invoke Agentforce agents programmatically via REST. Use cases: custom mobile/web apps powered by Agentforce, external event-triggered agent conversations (webhooks, IoT, etc.), non-Salesforce UIs that need agent capabilities. Uses OAuth 2.0 for authentication. Do not use when a built-in channel (Experience Cloud, Slack) already meets the need.', bullets: ['Use Agent API: custom non-Salesforce UIs', 'Use Agent API: external event-triggered conversations', 'Use standard channels: Experience Cloud, Slack, email'] },
      { heading: 'Agent-to-Agent Protocol', content: 'Enables multi-agent architectures where one orchestrator agent delegates subtasks to specialist worker agents. This pattern handles complex enterprise workflows that span multiple domains (sales + service + finance, etc.). Each specialist agent is configured independently and the orchestrator routes tasks based on context and user intent.' },
      { heading: 'New Agentforce Builder', content: 'GA February 2026. Canvas View: visual flowchart-style UI for no-code topic/action configuration. Script View: define agents in code (Agent Script language) for version control and CI/CD. Hybrid Reasoning Engine: deterministic control flows + generative AI flexibility in one experience. Topic Pass-Through: chain actions across topics without losing conversation context.' },
      { heading: 'Day 8 Key Exam Tips', content: 'MCP, Agent API, and Agent-to-Agent are advanced topics that may appear as 1-2 exam questions. Focus on: when to use Agent API vs. standard channels, what MCP enables vs. direct API integration, what Agent-to-Agent protocol enables (multi-agent collaboration). For observability: know the key metrics and how to use them to improve agents.', bullets: ['MCP = open standard, dynamic tool discovery', 'Agent API = non-Salesforce UIs and external event triggers', 'Agent-to-Agent = multi-agent orchestration', 'New Builder: Canvas (no-code) + Script (code) + hybrid reasoning'] },
    ]
  },
  {
    num: 9,
    title: 'Full Review, Practice Exam & Certification Prep',
    subtitle: 'Consolidate all 5 exam domains, flashcard review, capstone build, exam registration',
    time: '4–5h', examWeight: null, isFinal: true, color: '#4A4A48', bgColor: '#F1EFE8',
    helpLinks: [
      { title: 'Agentforce Specialist Exam Guide', url: 'https://trailhead.salesforce.com/credentials/agentforcespecialist' },
      { title: 'Cert Prep Module (Full)', url: 'https://trailhead.salesforce.com/content/learn/modules/cert-prep-agentforce-specialist' },
      { title: 'Agentforce Developer Guide', url: 'https://developer.salesforce.com/docs/einstein/genai/guide/what-is-agentforce.html' },
      { title: 'Webassessor Exam Registration', url: 'https://webassessor.com/salesforce' },
    ],
    trailheads: [
      { name: 'Cert Prep: Agentforce Specialist (Full Module)', type: 'Module', url: 'https://trailhead.salesforce.com/content/learn/modules/cert-prep-agentforce-specialist', icon: 'utility:check' },
      { name: 'Agentblazer Status (Champion + Innovator)', type: 'Trail', url: 'https://trailhead.salesforce.com/agentblazer', icon: 'utility:ribbon' },
      { name: 'Update Agentforce Concepts (Maintenance)', type: 'Module', url: 'https://trailhead.salesforce.com/content/learn/modules/agentforce-specialist-certification-maintenance-summer-25/get-up-to-date-on-agentforce-concepts', icon: 'utility:education' },
    ],
    topics: [
      {
        text: 'Exam Domain Review',
        sub: 'Prompt Engineering 30% + Agentforce Concepts 30% + Data 360 20% + Deployment 20%',
        docUrl: 'https://trailhead.salesforce.com/credentials/agentforcespecialist',
        details: [
          { heading: 'Domain Weights', text: 'Prompt Engineering (30%): Prompt Builder, template types, grounding, testing. Agentforce Concepts (30%): Topics, actions, agent types, channels, reasoning engine, filters, variables. Data Cloud/360 for Agentforce (20%): Data Library, RAG, retrievers, chunking, enabling vs. implementing. Deployment Lifecycle (20%): Testing Center, deployment, security, monitoring, versioning. Total: 60 questions, 105 minutes, 73% passing score.' },
          { heading: 'High-Value Areas', text: '(1) When to use each prompt template type. (2) How topic descriptions affect routing. (3) RAG vs. merge field grounding. (4) Agent User security model. (5) Testing Center pass/fail logic. (6) Standard RAG vs. Data 360 advanced RAG. (7) Escalation topic best practices. (8) Enabling vs. implementing Data 360.' },
          { heading: 'Exam Format', text: 'Scenario-based questions: "A company wants to do X, what is the BEST approach?" Eliminate clearly wrong answers first. When two answers seem correct, pick the Salesforce best practice answer. Do not overthink — Salesforce exams reward knowing their recommended approach, not edge cases.' },
        ]
      },
      {
        text: 'Practice Exams & Flashcards',
        sub: 'Trailhead cert prep flashcards, FocusOnForce practice exams, weak area review',
        docUrl: 'https://trailhead.salesforce.com/content/learn/modules/cert-prep-agentforce-specialist',
        details: [
          { heading: 'Trailhead Flashcards', text: 'The Agentforce Specialist Cert Prep module has interactive flashcards for all 5 exam domains. Complete all flashcard decks. Mark wrong answers and review those first. Aim for >90% flashcard accuracy before taking the real exam.' },
          { heading: 'Practice Exam Sources', text: 'FocusOnForce Agentforce Specialist practice exams (paid, highly recommended). Trailhead Cert Prep module quizzes (free). Trailblazer Community study groups. Take at least 2 full practice exams (60 questions each, timed) and review every wrong answer before booking.' },
        ]
      },
      {
        text: 'Capstone Build',
        sub: 'End-to-end agent covering all 9 days of learning',
        docUrl: 'https://trailhead.salesforce.com/content/learn/projects/quick-start-build-your-first-agent-with-agentforce',
        details: [
          { heading: 'Capstone Requirements', text: 'Build "Customer Support Bot": (1) 3 custom topics: Billing, Returns, Technical Support. (2) At least 2 Flow-based actions across topics. (3) 1 Apex action with @InvocableMethod. (4) 1 Prompt Builder Flex template as an agent action. (5) Agentforce Data Library with grounded KB. (6) Customer Verification on the Billing topic. (7) 10 Testing Center test cases at >80% pass rate.' },
          { heading: 'What This Proves', text: 'Completing this capstone demonstrates: agent configuration with multiple topics/actions, extending agents with custom automation, prompt engineering in real context, security best practices, grounding agents with real data, and validating behavior before deployment — exactly what the exam validates.' },
        ]
      },
      {
        text: 'Exam Registration & Logistics',
        sub: 'Webassessor, exam format, ID, passing score, maintenance',
        docUrl: 'https://webassessor.com/salesforce',
        details: [
          { heading: 'Registration', text: 'Register at webassessor.com/salesforce. Exam: Salesforce Agentforce Specialist. 60 multiple-choice/scenario questions, 105 minutes, 73% passing score. Online proctored from home or test center. Exam fee: $200 USD (verify current pricing — first attempt was free until Dec 2025).' },
          { heading: 'Exam Day', text: 'Online proctored: clear desk, stable internet, government ID ready, test camera/audio 24h before. During exam: read every answer before choosing, watch for "BEST", "MOST", "LEAST" qualifiers — they change the correct answer. Flag uncertain questions and return. Do not spend more than 90 seconds on any single question.' },
          { heading: 'Maintenance', text: 'After certification, complete the annual Agentforce Specialist maintenance module on Trailhead (released every summer) by the maintenance due date. Budget 2–3 hours per year. The maintenance module covers major new features released in the past year.' },
        ]
      },
    ],
    usecase: {
      text: 'Complete the capstone build and take 2 full practice exams under timed conditions.',
      steps: [
        'Build "Customer Support Bot" meeting all capstone requirements — 3 topics, flows, Apex, Prompt template, Data Library',
        'Add Customer Verification to the Billing topic; run Testing Center suite (>80% required)',
        'Take the Cert Prep flashcard review on Trailhead for all 5 domains',
        'Take FocusOnForce practice exam #1 under timed conditions (60 questions, 105 minutes)',
        'Review all wrong answers — re-read the relevant Trailhead module section for each missed topic',
        'Take practice exam #2 next day targeting >80% score then register on Webassessor',
      ]
    },
    studyDoc: [
      { heading: 'Exam Overview', content: 'Salesforce Agentforce Specialist Certification: 60 scenario-based questions, 105 minutes, 73% passing score. Questions are practical — "A company needs X, what is the BEST approach?" Focus on Salesforce recommended practices, not edge cases or undocumented behaviors.' },
      { heading: 'Final Domain Cheat Sheet', content: 'Prompt Engineering (30%): Flex template = agent actions. RAG = large changing knowledge bases. Zero-shot/few-shot/chain-of-thought. Merge fields = specific CRM field values. Agentforce Concepts (30%): Topic description = Atlas routing key. Company Context = highest priority. Filters = deterministic access control. Always include Escalation topic.', bullets: ['Data Cloud/360 (20%): Enabling ≠ Implementing. Web Search = remove General FAQ. Advanced RAG = unified profiles.', 'Deployment (20%): Testing Center >80% before prod. Agent User = least privilege. Agent Versioning = safe testing. Change Set or CLI for deployment.'] },
      { heading: 'Capstone Checklist', content: 'Before calling yourself ready for the exam, verify you can do all of these from memory:', bullets: ['Create a Flex prompt template in Prompt Builder', 'Build and test a Service Agent with 3+ custom topics', 'Register a Flow and Apex action in Agentforce Assets', 'Configure a Data Library and attach to an agent', 'Create and run a Testing Center test suite', 'Explain the Trust Layer to a non-technical stakeholder', 'Choose between Einstein Bots and Agentforce for a given scenario', 'Deploy an agent from sandbox to production'] },
      { heading: 'Exam Day Strategy', content: 'Read every answer option before choosing. Watch for: "BEST" (implies multiple could work, pick the recommended one), "LEAST" (inverse logic), "MOST LIKELY" (probabilistic). Eliminate impossible answers first. If two answers seem equally correct, ask: which follows Salesforce best practice more closely? Flag uncertain questions — come back with fresh eyes. Pace: 105 min / 60 questions = 1min 45sec per question.' },
    ]
  },
];

const STAR_LABELS = ['','⭐ Needs Review', '⭐⭐ Getting There', '⭐⭐⭐ Decent', '⭐⭐⭐⭐ Good', '⭐⭐⭐⭐⭐ Mastered!'];

export default class AgentforceStudyPlan extends NavigationMixin(LightningElement) {
    @track currentIndex = 0;
    @track completed = new Array(9).fill(false);
    @track activeTopicText = null;
    @track activeSection = 0;   // 0=Topics 1=UseCase 2=Trailheads 3=Notes
    @track notes = Array.from({length:9}, () => ({ takeaways:'', handson:'', questions:'', stars:0 }));
    @track noteSaved = false;
    @track _noteSavedTimer = null;

    // ── Days (for tabs + progress bar) ──
    get days() {
        return DAYS_DATA.map((d, i) => ({
            ...d, index: i,
            isActive: i === this.currentIndex,
            tabClass: `sp-tab ${i === this.currentIndex ? 'sp-tab--active' : ''}`,
            segClass: `sp-seg ${this.completed[i] ? 'sp-seg--done' : i === this.currentIndex ? 'sp-seg--active' : ''}`
        }));
    }

    // ── Active day ──
    get activeDay() {
        const d = DAYS_DATA[this.currentIndex];
        const c = this.completed[this.currentIndex];
        return {
            ...d, index: this.currentIndex,
            topics: d.topics.map(t => ({
                ...t,
                cardClass: `sp-topic ${this.activeTopicText === t.text ? 'sp-topic--active' : ''}`
            })),
            completed: c,
            completeTitle: c ? 'Mark incomplete' : 'Mark as complete'
        };
    }

    get activeTopic() {
        if (!this.activeTopicText) return null;
        return DAYS_DATA[this.currentIndex].topics.find(t => t.text === this.activeTopicText) || null;
    }

    // ── Styles ──
    get activeDayHeadStyle() { return `background:${DAYS_DATA[this.currentIndex].bgColor};`; }
    get activeDayBadgeStyle() { return `background:${DAYS_DATA[this.currentIndex].color};color:#fff;`; }
    get activeDayDotStyle()   { return `background:${DAYS_DATA[this.currentIndex].color};`; }
    get activeDayDocHeadStyle() { return `color:${DAYS_DATA[this.currentIndex].color};border-left:3px solid ${DAYS_DATA[this.currentIndex].color};`; }

    // ── Stats ──
    get completedCount() { return this.completed.filter(Boolean).length; }
    get progressPct()    { return Math.round((this.completedCount / 9) * 100); }
    get currentDayNum()  { return this.currentIndex + 1; }

    // ── Navigation ──
    get hasPrev() { return this.currentIndex > 0; }
    get hasNext() { return this.currentIndex < 8; }

    // ── Complete button class ──
    get completeBtnClass() {
        return `sp-btn ${this.completed[this.currentIndex] ? 'sp-btn--done' : 'sp-btn--mark'}`;
    }

    // ── Section tab classes ──
    get tab0Class() { return `sp-itab ${this.activeSection===0?'sp-itab--active':''}`; }
    get tab1Class() { return `sp-itab ${this.activeSection===1?'sp-itab--active':''}`; }
    get tab2Class() { return `sp-itab ${this.activeSection===2?'sp-itab--active':''}`; }
    get tab3Class() { return `sp-itab ${this.activeSection===3?'sp-itab--active':''}`; }

    // ── Section visibility ──
    get showTopics()     { return this.activeSection === 0; }
    get showUseCase()    { return this.activeSection === 1; }
    get showTrailheads() { return this.activeSection === 2; }
    get showNotes()      { return this.activeSection === 3; }

    // ── Notes ──
    get activeDayNote() { return this.notes[this.currentIndex]; }
    get starList() {
        const cur = this.notes[this.currentIndex].stars;
        return [1,2,3,4,5].map(v => ({ val:v, cls:`sp-star ${v<=cur?'sp-star--on':''}` }));
    }
    get starLabel() {
        return STAR_LABELS[this.notes[this.currentIndex].stars] || 'Not rated yet';
    }

    // ── Handlers ──
    handleTabClick(evt) {
        this.currentIndex = parseInt(evt.currentTarget.dataset.index, 10);
        this.activeTopicText = null;
        this.noteSaved = false;
    }
    handleSegClick(evt) {
        this.currentIndex = parseInt(evt.currentTarget.dataset.index, 10);
        this.activeTopicText = null;
    }
    handleSectionTab(evt) {
        this.activeSection = parseInt(evt.currentTarget.dataset.tab, 10);
        this.activeTopicText = null;
    }
    handleTopicClick(evt) {
        const t = evt.currentTarget.dataset.topic;
        this.activeTopicText = this.activeTopicText === t ? null : t;
    }
    closeTopic() { this.activeTopicText = null; }
    toggleComplete(evt) {
        const idx = parseInt(evt.currentTarget.dataset.index, 10);
        const updated = [...this.completed];
        updated[idx] = !updated[idx];
        this.completed = updated;
    }
    goPrev() { if(this.hasPrev){ this.currentIndex--; this.activeTopicText=null; } }
    goNext() { if(this.hasNext){ this.currentIndex++; this.activeTopicText=null; } }

    // ── External navigation (fixes invalid link issue) ──
    navigateToUrl(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        const url = evt.currentTarget.dataset.url;
        if (!url) return;
        // NavigationMixin properly handles external URLs in LWC — no raw window.open needed
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: { url: url }
        });
    }

    openExamLink() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: { url: 'https://webassessor.com/salesforce' }
        });
    }

    // ── Notes handlers ──
    handleNoteChange(evt) {
        const field = evt.currentTarget.dataset.field;
        const val   = evt.detail.value !== undefined ? evt.detail.value : evt.target.value;
        const updated = this.notes.map((n,i) => i===this.currentIndex ? {...n,[field]:val} : n);
        this.notes = updated;
        this.noteSaved = false;
    }
    handleStar(evt) {
        const val = parseInt(evt.currentTarget.dataset.val, 10);
        const cur = this.notes[this.currentIndex].stars;
        const newVal = cur===val ? 0 : val;
        const updated = this.notes.map((n,i) => i===this.currentIndex ? {...n,stars:newVal} : n);
        this.notes = updated;
    }
    saveNote() {
        // In a real org you would call an Apex method here to persist to a custom object.
        // For now we store in component state and show a confirmation.
        this.noteSaved = true;
        if(this._noteSavedTimer) clearTimeout(this._noteSavedTimer);
        this._noteSavedTimer = setTimeout(()=>{ this.noteSaved=false; }, 3000);
    }
    clearNote() {
        const updated = this.notes.map((n,i) => i===this.currentIndex ? {takeaways:'',handson:'',questions:'',stars:0} : n);
        this.notes = updated;
        this.noteSaved = false;
    }
}