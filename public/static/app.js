// =====================================================
// HANDOFF MANAGEMENT SYSTEM - FRONTEND
// Infinity Growth Loop • Zero Context Loss
// =====================================================

const API_BASE = window.location.origin

// =====================================================
// PAGE LOAD
// =====================================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Handoff Management System loaded')
  await loadStats()
  await loadProjects()
})

// =====================================================
// LOAD STATISTICS
// =====================================================
async function loadStats() {
  try {
    const response = await axios.get(`${API_BASE}/api/stats`)
    
    if (response.data.success) {
      const stats = response.data.stats
      document.getElementById('total-projects').textContent = stats.total_projects
      document.getElementById('total-sessions').textContent = stats.total_sessions
      document.getElementById('avg-efficiency').textContent = `${(stats.avg_efficiency * 100).toFixed(0)}%`
      document.getElementById('context-quality').textContent = `${(stats.context_quality * 100).toFixed(0)}%`
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

// =====================================================
// LOAD PROJECTS
// =====================================================
async function loadProjects() {
  try {
    const response = await axios.get(`${API_BASE}/api/projects`)
    
    if (response.data.success) {
      const projects = response.data.projects
      const container = document.getElementById('projects-list')
      
      if (projects.length === 0) {
        container.innerHTML = `
          <div class="text-center py-8 text-gray-500">
            <i class="fas fa-folder-open text-4xl mb-4"></i>
            <p>No projects yet. Create your first project!</p>
          </div>
        `
        return
      }
      
      container.innerHTML = projects.map(project => `
        <div class="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition cursor-pointer"
             onclick="viewProject(${project.id})">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-800 mb-1">${escapeHtml(project.name)}</h3>
              <p class="text-gray-600 text-sm">${escapeHtml(project.description || 'No description')}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-sm font-semibold
                        ${project.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">
              ${project.status}
            </span>
          </div>
          
          <div class="grid grid-cols-3 gap-4 text-center border-t pt-4">
            <div>
              <div class="text-2xl font-bold text-indigo-600">${project.total_sessions}</div>
              <div class="text-xs text-gray-500">Sessions</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-purple-600">${(project.efficiency_score * 100).toFixed(0)}%</div>
              <div class="text-xs text-gray-500">Efficiency</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-pink-600">${project.knowledge_score.toFixed(2)}x</div>
              <div class="text-xs text-gray-500">Knowledge</div>
            </div>
          </div>
          
          ${project.repository_url ? `
            <div class="mt-4 pt-4 border-t">
              <a href="${escapeHtml(project.repository_url)}" target="_blank" 
                 class="text-sm text-indigo-600 hover:text-indigo-800"
                 onclick="event.stopPropagation()">
                <i class="fab fa-github mr-2"></i>View Repository
              </a>
            </div>
          ` : ''}
        </div>
      `).join('')
    }
  } catch (error) {
    console.error('Failed to load projects:', error)
    showNotification('Failed to load projects', 'error')
  }
}

// =====================================================
// CREATE PROJECT
// =====================================================
async function createProject() {
  const name = prompt('Enter project name:')
  if (!name) return
  
  const description = prompt('Enter project description (optional):')
  const repository_url = prompt('Enter repository URL (optional):')
  
  try {
    const response = await axios.post(`${API_BASE}/api/projects`, {
      name,
      description,
      repository_url
    })
    
    if (response.data.success) {
      showNotification('Project created successfully!', 'success')
      await loadStats()
      await loadProjects()
    }
  } catch (error) {
    console.error('Failed to create project:', error)
    showNotification('Failed to create project', 'error')
  }
}

// =====================================================
// VIEW PROJECT (SESSIONS)
// =====================================================
async function viewProject(projectId) {
  try {
    // Get project details
    const projectResponse = await axios.get(`${API_BASE}/api/projects/${projectId}`)
    if (!projectResponse.data.success) {
      showNotification('Failed to load project', 'error')
      return
    }
    const project = projectResponse.data.project
    
    // Get project sessions
    const sessionsResponse = await axios.get(`${API_BASE}/api/projects/${projectId}/sessions`)
    if (!sessionsResponse.data.success) {
      showNotification('Failed to load sessions', 'error')
      return
    }
    const sessions = sessionsResponse.data.sessions
    
    // Get growth metrics
    const growthResponse = await axios.get(`${API_BASE}/api/projects/${projectId}/growth`)
    const metrics = growthResponse.data.success ? growthResponse.data.metrics : []
    
    // Show project modal
    showProjectModal(project, sessions, metrics)
  } catch (error) {
    console.error('Failed to view project:', error)
    showNotification('Failed to load project details', 'error')
  }
}

// =====================================================
// SHOW PROJECT MODAL
// =====================================================
function showProjectModal(project, sessions, metrics) {
  const modalHTML = `
    <div id="project-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
         onclick="if(event.target === this) closeModal()">
      <div class="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-3xl font-bold mb-2">${escapeHtml(project.name)}</h2>
              <p class="text-indigo-100">${escapeHtml(project.description || 'No description')}</p>
            </div>
            <button onclick="closeModal()" class="text-white hover:text-gray-200 text-2xl">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Growth Metrics */}
          <div class="grid grid-cols-4 gap-4 mb-6">
            <div class="bg-indigo-50 rounded-xl p-4 text-center">
              <div class="text-3xl font-bold text-indigo-600">${project.total_sessions}</div>
              <div class="text-sm text-gray-600">Total Sessions</div>
            </div>
            <div class="bg-purple-50 rounded-xl p-4 text-center">
              <div class="text-3xl font-bold text-purple-600">${(project.efficiency_score * 100).toFixed(0)}%</div>
              <div class="text-sm text-gray-600">Efficiency</div>
            </div>
            <div class="bg-pink-50 rounded-xl p-4 text-center">
              <div class="text-3xl font-bold text-pink-600">${project.knowledge_score.toFixed(2)}x</div>
              <div class="text-sm text-gray-600">Knowledge</div>
            </div>
            <div class="bg-green-50 rounded-xl p-4 text-center">
              <div class="text-3xl font-bold text-green-600">${(project.context_preservation * 100).toFixed(0)}%</div>
              <div class="text-sm text-gray-600">Context Quality</div>
            </div>
          </div>
          
          {/* Actions */}
          <div class="flex gap-4 mb-6">
            <button onclick="createSession(${project.id})" 
                    class="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition">
              <i class="fas fa-plus mr-2"></i>Create New Session
            </button>
            <button onclick="viewGrowthChart(${project.id})" 
                    class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition">
              <i class="fas fa-chart-line mr-2"></i>View Growth Chart
            </button>
          </div>
          
          {/* Sessions Timeline */}
          <div>
            <h3 class="text-xl font-bold text-gray-800 mb-4">
              <i class="fas fa-timeline mr-2 text-indigo-600"></i>Sessions Timeline
            </h3>
            
            ${sessions.length === 0 ? `
              <div class="text-center py-8 text-gray-500">
                <i class="fas fa-clipboard-list text-4xl mb-4"></i>
                <p>No sessions yet. Create your first session!</p>
              </div>
            ` : `
              <div class="space-y-4">
                ${sessions.map((session, index) => `
                  <div class="border-l-4 ${getSessionBorderColor(session.status)} pl-6 py-4 relative">
                    {/* Session number badge */}
                    <div class="absolute -left-8 top-4 w-12 h-12 rounded-full bg-white border-4 ${getSessionBorderColor(session.status)} 
                                flex items-center justify-center font-bold text-gray-800">
                      #${session.session_number}
                    </div>
                    
                    {/* Session content */}
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h4 class="font-bold text-lg text-gray-800 mb-1">${escapeHtml(session.title)}</h4>
                        <p class="text-gray-600 text-sm mb-2">${escapeHtml(session.description || 'No description')}</p>
                        
                        <div class="flex flex-wrap gap-4 text-sm">
                          <span class="text-gray-600">
                            <i class="fas fa-coins mr-1"></i>${session.credit_used || 0}/${session.credit_budget} credits
                          </span>
                          ${session.duration_minutes ? `
                            <span class="text-gray-600">
                              <i class="fas fa-clock mr-1"></i>${session.duration_minutes} mins
                            </span>
                          ` : ''}
                          ${session.efficiency ? `
                            <span class="text-green-600 font-semibold">
                              <i class="fas fa-chart-line mr-1"></i>${(session.efficiency * 100).toFixed(0)}% efficiency
                            </span>
                          ` : ''}
                        </div>
                      </div>
                      
                      <div class="flex gap-2">
                        <span class="px-3 py-1 rounded-full text-sm font-semibold ${getSessionStatusClass(session.status)}">
                          ${session.status}
                        </span>
                        ${session.status === 'completed' ? `
                          <button onclick="viewHandoff(${session.id})" 
                                  class="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                            <i class="fas fa-file-alt mr-1"></i>Handoff
                          </button>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `
  
  document.body.insertAdjacentHTML('beforeend', modalHTML)
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================
function getSessionBorderColor(status) {
  switch(status) {
    case 'completed': return 'border-green-500'
    case 'in_progress': return 'border-blue-500'
    case 'failed': return 'border-red-500'
    default: return 'border-gray-300'
  }
}

function getSessionStatusClass(status) {
  switch(status) {
    case 'completed': return 'bg-green-100 text-green-700'
    case 'in_progress': return 'bg-blue-100 text-blue-700'
    case 'failed': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

function closeModal() {
  const modal = document.getElementById('project-modal')
  if (modal) modal.remove()
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function showNotification(message, type = 'info') {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-indigo-500'
  }
  
  const notification = document.createElement('div')
  notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50`
  notification.textContent = message
  
  document.body.appendChild(notification)
  
  setTimeout(() => notification.remove(), 3000)
}

function createSession(projectId) {
  console.log('Creating session for project:', projectId)
  alert('Create Session functionality - To be implemented')
}

function viewHandoff(sessionId) {
  console.log('Viewing handoff for session:', sessionId)
  alert('View Handoff functionality - To be implemented')
}

function viewGrowthChart(projectId) {
  console.log('Viewing growth chart for project:', projectId)
  alert('Growth Chart functionality - To be implemented')
}
