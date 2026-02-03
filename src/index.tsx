import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'

// =====================================================
// TYPE DEFINITIONS
// =====================================================
type Bindings = {
  DB: D1Database
}

interface Project {
  id: number
  name: string
  description?: string
  repository_url?: string
  status: string
  total_sessions: number
  efficiency_score: number
  knowledge_score: number
  context_preservation: number
  created_at: string
  updated_at: string
}

interface Session {
  id: number
  project_id: number
  session_number: number
  title: string
  description?: string
  status: string
  credit_budget: number
  credit_used: number
  duration_minutes?: number
  efficiency?: number
  requirements?: string
  accomplishments?: string
  blockers?: string
  troubleshooting?: string
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

interface Handoff {
  id: number
  session_id: number
  project_id: number
  current_state: string
  actual_state: string
  requirements_checklist: string
  troubleshooting_results?: string
  next_steps: string
  future_recommendations?: string
  version: string
  context_quality: number
  requirements_completion_rate: number
  created_at: string
}

// =====================================================
// MAIN APPLICATION
// =====================================================
const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API endpoints
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Use renderer for HTML pages
app.use(renderer)

// =====================================================
// HOMEPAGE
// =====================================================
app.get('/', (c) => {
  return c.render(
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Handoff Management System - Infinity Growth Loop</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body class="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen">
        <div class="container mx-auto px-4 py-8">
          {/* Header */}
          <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-transparent bg-clip-text mb-2">
                  ♾️ Handoff Management System
                </h1>
                <p class="text-gray-600 text-lg">
                  Infinity Growth Loop • Zero Context Loss • Automated Checkpoints
                </p>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-500">System Status</div>
                <div class="text-2xl font-bold text-green-500">
                  <i class="fas fa-circle-check mr-2"></i>ACTIVE
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
              <div class="text-sm text-gray-500 mb-1">Total Projects</div>
              <div class="text-3xl font-bold text-indigo-600" id="total-projects">-</div>
            </div>
            <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div class="text-sm text-gray-500 mb-1">Total Sessions</div>
              <div class="text-3xl font-bold text-purple-600" id="total-sessions">-</div>
            </div>
            <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500">
              <div class="text-sm text-gray-500 mb-1">Avg Efficiency</div>
              <div class="text-3xl font-bold text-pink-600" id="avg-efficiency">-</div>
            </div>
            <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div class="text-sm text-gray-500 mb-1">Context Quality</div>
              <div class="text-3xl font-bold text-green-600" id="context-quality">-</div>
            </div>
          </div>

          {/* Main Content */}
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Projects List */}
            <div class="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-gray-800">
                  <i class="fas fa-folder-open mr-2 text-indigo-600"></i>Projects
                </h2>
                <button 
                  class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition"
                  onclick="createProject()"
                >
                  <i class="fas fa-plus mr-2"></i>New Project
                </button>
              </div>
              <div id="projects-list" class="space-y-4">
                {/* Projects will be loaded here */}
              </div>
            </div>

            {/* Session Workflow */}
            <div class="bg-white rounded-2xl shadow-xl p-6">
              <h2 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-clipboard-check mr-2 text-purple-600"></i>Handoff Workflow
              </h2>
              <div class="space-y-4">
                <div class="border-l-4 border-indigo-500 pl-4 py-2">
                  <div class="font-semibold text-gray-800">1. Analyze Current State</div>
                  <div class="text-sm text-gray-600">Review project actual state</div>
                </div>
                <div class="border-l-4 border-purple-500 pl-4 py-2">
                  <div class="font-semibold text-gray-800">2. Checkpoint Requirements</div>
                  <div class="text-sm text-gray-600">Verify previous handoff completion</div>
                </div>
                <div class="border-l-4 border-pink-500 pl-4 py-2">
                  <div class="font-semibold text-gray-800">3. Troubleshoot Errors</div>
                  <div class="text-sm text-gray-600">Check & fix any errors</div>
                </div>
                <div class="border-l-4 border-green-500 pl-4 py-2">
                  <div class="font-semibold text-gray-800">4. Execute Session</div>
                  <div class="text-sm text-gray-600">Only if all checks pass</div>
                </div>
                <div class="border-l-4 border-blue-500 pl-4 py-2">
                  <div class="font-semibold text-gray-800">5. Generate Handoff</div>
                  <div class="text-sm text-gray-600">Create next session handoff</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
      </body>
    </html>
  )
})

// =====================================================
// API ENDPOINTS
// =====================================================

// Get Statistics
app.get('/api/stats', async (c) => {
  const { DB } = c.env

  try {
    const projects = await DB.prepare('SELECT COUNT(*) as count FROM projects').first()
    const sessions = await DB.prepare('SELECT COUNT(*) as count FROM sessions').first()
    const avgEfficiency = await DB.prepare('SELECT AVG(efficiency_score) as avg FROM projects').first()
    const avgContextQuality = await DB.prepare('SELECT AVG(context_preservation) as avg FROM projects').first()

    return c.json({
      success: true,
      stats: {
        total_projects: projects?.count || 0,
        total_sessions: sessions?.count || 0,
        avg_efficiency: (avgEfficiency?.avg || 0.70).toFixed(2),
        context_quality: (avgContextQuality?.avg || 0.98).toFixed(2)
      }
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// List All Projects
app.get('/api/projects', async (c) => {
  const { DB } = c.env

  try {
    const result = await DB.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all()
    return c.json({ success: true, projects: result.results })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// Get Single Project
app.get('/api/projects/:id', async (c) => {
  const { DB } = c.env
  const projectId = c.req.param('id')

  try {
    const project = await DB.prepare('SELECT * FROM projects WHERE id = ?').bind(projectId).first()
    
    if (!project) {
      return c.json({ success: false, error: 'Project not found' }, 404)
    }

    return c.json({ success: true, project })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// Create New Project
app.post('/api/projects', async (c) => {
  const { DB } = c.env

  try {
    const body = await c.req.json()
    const { name, description, repository_url } = body

    if (!name) {
      return c.json({ success: false, error: 'Project name is required' }, 400)
    }

    const result = await DB.prepare(`
      INSERT INTO projects (name, description, repository_url)
      VALUES (?, ?, ?)
    `).bind(name, description || null, repository_url || null).run()

    return c.json({
      success: true,
      project_id: result.meta.last_row_id,
      message: 'Project created successfully'
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// Get Project Sessions
app.get('/api/projects/:id/sessions', async (c) => {
  const { DB } = c.env
  const projectId = c.req.param('id')

  try {
    const result = await DB.prepare(
      'SELECT * FROM sessions WHERE project_id = ? ORDER BY session_number DESC'
    ).bind(projectId).all()

    return c.json({ success: true, sessions: result.results })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// Create New Session
app.post('/api/sessions/create', async (c) => {
  const { DB } = c.env

  try {
    const body = await c.req.json()
    const { project_id, title, description, credit_budget } = body

    if (!project_id || !title) {
      return c.json({ success: false, error: 'Project ID and title are required' }, 400)
    }

    // Get next session number
    const lastSession = await DB.prepare(
      'SELECT MAX(session_number) as last_number FROM sessions WHERE project_id = ?'
    ).bind(project_id).first()

    const nextSessionNumber = (lastSession?.last_number || 0) + 1

    // Get previous handoff
    let previousHandoff = null
    if (nextSessionNumber > 1) {
      previousHandoff = await DB.prepare(`
        SELECT h.* FROM handoffs h
        JOIN sessions s ON h.session_id = s.id
        WHERE h.project_id = ?
        ORDER BY s.session_number DESC
        LIMIT 1
      `).bind(project_id).first()
    }

    // Create session
    const result = await DB.prepare(`
      INSERT INTO sessions (project_id, session_number, title, description, credit_budget, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `).bind(project_id, nextSessionNumber, title, description || null, credit_budget || 100).run()

    return c.json({
      success: true,
      session_id: result.meta.last_row_id,
      session_number: nextSessionNumber,
      previous_handoff: previousHandoff,
      message: 'Session created successfully'
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// Complete Session
app.post('/api/sessions/:id/complete', async (c) => {
  const { DB } = c.env
  const sessionId = c.req.param('id')

  try {
    const body = await c.req.json()
    const {
      credit_used,
      duration_minutes,
      accomplishments,
      blockers,
      troubleshooting,
      current_state,
      actual_state,
      requirements_checklist,
      next_steps,
      future_recommendations
    } = body

    // Update session
    await DB.prepare(`
      UPDATE sessions
      SET credit_used = ?, duration_minutes = ?, accomplishments = ?, blockers = ?,
          troubleshooting = ?, completed_at = CURRENT_TIMESTAMP, status = 'completed'
      WHERE id = ?
    `).bind(
      credit_used || 0,
      duration_minutes || null,
      accomplishments || null,
      blockers || null,
      troubleshooting || null,
      sessionId
    ).run()

    // Get session info
    const session = await DB.prepare('SELECT * FROM sessions WHERE id = ?').bind(sessionId).first()

    if (!session) {
      return c.json({ success: false, error: 'Session not found' }, 404)
    }

    // Calculate efficiency
    const efficiency = session.credit_budget > 0 
      ? Math.min(session.credit_budget / (credit_used || session.credit_budget), 1.0)
      : 0.70

    // Update session efficiency
    await DB.prepare('UPDATE sessions SET efficiency = ? WHERE id = ?').bind(efficiency, sessionId).run()

    // Create handoff document
    const version = `v${session.session_number}.0.0`
    
    await DB.prepare(`
      INSERT INTO handoffs (
        session_id, project_id, current_state, actual_state,
        requirements_checklist, next_steps, future_recommendations, version
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      sessionId,
      session.project_id,
      current_state || 'Session completed',
      actual_state || 'All requirements met',
      requirements_checklist || '[]',
      next_steps || 'Ready for next session',
      future_recommendations || null,
      version
    ).run()

    // Update project metrics
    const project = await DB.prepare('SELECT * FROM projects WHERE id = ?').bind(session.project_id).first()
    
    if (project) {
      const newTotalSessions = project.total_sessions + 1
      const newEfficiency = 0.7 + 0.25 * Math.tanh(newTotalSessions / 50)
      const newKnowledge = 1 + Math.log(1 + newTotalSessions / 10)

      await DB.prepare(`
        UPDATE projects
        SET total_sessions = ?, efficiency_score = ?, knowledge_score = ?
        WHERE id = ?
      `).bind(newTotalSessions, newEfficiency, newKnowledge, session.project_id).run()

      // Record growth metrics
      await DB.prepare(`
        INSERT INTO growth_metrics (project_id, session_number, efficiency, knowledge, effective_output)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        session.project_id,
        session.session_number,
        newEfficiency,
        newKnowledge,
        100 * newEfficiency * newKnowledge
      ).run()
    }

    return c.json({
      success: true,
      message: 'Session completed successfully',
      efficiency: efficiency.toFixed(3),
      version: version
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// Get Session Handoff
app.get('/api/sessions/:id/handoff', async (c) => {
  const { DB } = c.env
  const sessionId = c.req.param('id')

  try {
    const handoff = await DB.prepare('SELECT * FROM handoffs WHERE session_id = ?').bind(sessionId).first()
    
    if (!handoff) {
      return c.json({ success: false, error: 'Handoff not found' }, 404)
    }

    return c.json({ success: true, handoff })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// Get Project Growth Metrics
app.get('/api/projects/:id/growth', async (c) => {
  const { DB } = c.env
  const projectId = c.req.param('id')

  try {
    const result = await DB.prepare(
      'SELECT * FROM growth_metrics WHERE project_id = ? ORDER BY session_number ASC'
    ).bind(projectId).all()

    return c.json({ success: true, metrics: result.results })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// Health Check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'Handoff Management System',
    timestamp: new Date().toISOString()
  })
})

export default app
