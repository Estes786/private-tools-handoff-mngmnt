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
                        ` : session.status === 'pending' ? `
                          <button onclick="completeSession(${session.id})" 
                                  class="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                            <i class="fas fa-check mr-1"></i>Complete
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

// =====================================================
// COMPLETE SESSION FORM
// =====================================================
async function completeSession(sessionId) {
  try {
    // Get session details
    const sessionsResponse = await axios.get(`${API_BASE}/api/sessions/${sessionId}`)
    if (!sessionsResponse.data || !sessionsResponse.data.session) {
      showNotification('Failed to load session', 'error')
      return
    }
    const session = sessionsResponse.data.session
    
    const modalHTML = `
      <div id="complete-session-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
           onclick="if(event.target === this) closeModal('complete-session-modal')">
        <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div class="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold mb-1">Complete Session</h2>
                <p class="text-green-100">Session #${session.session_number} - ${escapeHtml(session.title)}</p>
              </div>
              <button onclick="closeModal('complete-session-modal')" class="text-white hover:text-gray-200 text-2xl">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <form id="complete-session-form" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Credits Used *</label>
                  <input type="number" id="credit-used" required min="0" max="${session.credit_budget}"
                         class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                         placeholder="0">
                  <p class="text-xs text-gray-500 mt-1">Budget: ${session.credit_budget} credits</p>
                </div>
                
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Duration (minutes) *</label>
                  <input type="number" id="duration-minutes" required min="1"
                         class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                         placeholder="60">
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Accomplishments *</label>
                <textarea id="accomplishments" rows="4" required
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="List all tasks completed in this session..."></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Current State *</label>
                <textarea id="current-state" rows="3" required
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Describe current state of the project..."></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Actual State *</label>
                <textarea id="actual-state" rows="3" required
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="What actually got implemented vs planned..."></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Requirements Checklist *</label>
                <textarea id="requirements-checklist" rows="4" required
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="- [x] Requirement 1 completed&#10;- [x] Requirement 2 completed&#10;- [ ] Requirement 3 pending"></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Blockers & Issues</label>
                <textarea id="blockers" rows="3"
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Any blockers encountered (optional)..."></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Troubleshooting & Fixes</label>
                <textarea id="troubleshooting" rows="3"
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="How issues were resolved (optional)..."></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Next Steps *</label>
                <textarea id="next-steps" rows="4" required
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="What needs to be done in the next session..."></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Future Recommendations</label>
                <textarea id="future-recommendations" rows="3"
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Long-term recommendations (optional)..."></textarea>
              </div>
              
              <div class="pt-4 flex gap-3">
                <button type="button" onclick="closeModal('complete-session-modal')"
                        class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit"
                        class="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition">
                  <i class="fas fa-check mr-2"></i>Complete Session & Generate Handoff
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modalHTML)
    
    // Handle form submission
    document.getElementById('complete-session-form').addEventListener('submit', async (e) => {
      e.preventDefault()
      
      const data = {
        credit_used: parseInt(document.getElementById('credit-used').value),
        duration_minutes: parseInt(document.getElementById('duration-minutes').value),
        accomplishments: document.getElementById('accomplishments').value,
        current_state: document.getElementById('current-state').value,
        actual_state: document.getElementById('actual-state').value,
        requirements_checklist: document.getElementById('requirements-checklist').value,
        blockers: document.getElementById('blockers').value || null,
        troubleshooting: document.getElementById('troubleshooting').value || null,
        next_steps: document.getElementById('next-steps').value,
        future_recommendations: document.getElementById('future-recommendations').value || null
      }
      
      try {
        const response = await axios.post(`${API_BASE}/api/sessions/${sessionId}/complete`, data)
        
        if (response.data.success) {
          showNotification('Session completed & handoff generated!', 'success')
          closeModal('complete-session-modal')
          closeModal('project-modal')
          await loadStats()
          await loadProjects()
        }
      } catch (error) {
        console.error('Failed to complete session:', error)
        showNotification('Failed to complete session', 'error')
      }
    })
  } catch (error) {
    console.error('Failed to load session:', error)
    showNotification('Failed to load session details', 'error')
  }
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

// =====================================================
// CREATE SESSION MODAL
// =====================================================
async function createSession(projectId) {
  try {
    // Get project info for next session number
    const projectResponse = await axios.get(`${API_BASE}/api/projects/${projectId}`)
    if (!projectResponse.data.success) {
      showNotification('Failed to load project', 'error')
      return
    }
    const project = projectResponse.data.project
    
    // Show create session modal
    const modalHTML = `
      <div id="create-session-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
           onclick="if(event.target === this) closeModal('create-session-modal')">
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold mb-1">Create New Session</h2>
                <p class="text-indigo-100">Session #${project.total_sessions + 1} for ${escapeHtml(project.name)}</p>
              </div>
              <button onclick="closeModal('create-session-modal')" class="text-white hover:text-gray-200 text-2xl">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <form id="create-session-form" class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Session Title *</label>
                <input type="text" id="session-title" required
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                       placeholder="e.g., Implement user authentication">
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea id="session-description" rows="3"
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Brief description of session goals..."></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Credit Budget</label>
                <input type="number" id="session-credit-budget" value="100" min="10" max="500"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              </div>
              
              <div class="pt-4 flex gap-3">
                <button type="button" onclick="closeModal('create-session-modal')"
                        class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit"
                        class="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition">
                  <i class="fas fa-plus mr-2"></i>Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modalHTML)
    
    // Handle form submission
    document.getElementById('create-session-form').addEventListener('submit', async (e) => {
      e.preventDefault()
      
      const title = document.getElementById('session-title').value
      const description = document.getElementById('session-description').value
      const credit_budget = parseInt(document.getElementById('session-credit-budget').value)
      
      try {
        const response = await axios.post(`${API_BASE}/api/sessions/create`, {
          project_id: projectId,
          title,
          description,
          credit_budget
        })
        
        if (response.data.success) {
          showNotification(`Session #${response.data.session_number} created successfully!`, 'success')
          closeModal('create-session-modal')
          closeModal('project-modal')
          await loadStats()
          await loadProjects()
          // Reopen project modal to show new session
          setTimeout(() => viewProject(projectId), 500)
        }
      } catch (error) {
        console.error('Failed to create session:', error)
        showNotification('Failed to create session', 'error')
      }
    })
  } catch (error) {
    console.error('Failed to load project:', error)
    showNotification('Failed to load project details', 'error')
  }
}

// =====================================================
// VIEW HANDOFF DOCUMENT
// =====================================================
async function viewHandoff(sessionId) {
  try {
    const response = await axios.get(`${API_BASE}/api/sessions/${sessionId}/handoff`)
    
    if (response.data.success) {
      const handoff = response.data.handoff_document
      
      const modalHTML = `
        <div id="handoff-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
             onclick="if(event.target === this) closeModal('handoff-modal')">
          <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div class="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-2xl font-bold mb-1">Handoff Document</h2>
                  <p class="text-green-100">Session #${response.data.session_number} - Generated handoff</p>
                </div>
                <div class="flex gap-2">
                  <button onclick="downloadHandoff(${sessionId})" 
                          class="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition">
                    <i class="fas fa-download mr-2"></i>Download
                  </button>
                  <button onclick="closeModal('handoff-modal')" class="text-white hover:text-gray-200 text-2xl">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="p-6 overflow-y-auto max-h-[calc(90vh-150px)]">
              <div class="prose max-w-none">
                <pre class="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg border">${escapeHtml(handoff)}</pre>
              </div>
            </div>
          </div>
        </div>
      `
      
      document.body.insertAdjacentHTML('beforeend', modalHTML)
    }
  } catch (error) {
    console.error('Failed to load handoff:', error)
    showNotification('Failed to load handoff document', 'error')
  }
}

// =====================================================
// DOWNLOAD HANDOFF
// =====================================================
async function downloadHandoff(sessionId) {
  try {
    const response = await axios.get(`${API_BASE}/api/sessions/${sessionId}/handoff`)
    
    if (response.data.success) {
      const handoff = response.data.handoff_document
      const sessionNumber = response.data.session_number
      const blob = new Blob([handoff], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `HANDOFF_SESSION_${sessionNumber.toString().padStart(3, '0')}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showNotification('Handoff downloaded successfully!', 'success')
    }
  } catch (error) {
    console.error('Failed to download handoff:', error)
    showNotification('Failed to download handoff', 'error')
  }
}

// =====================================================
// VIEW GROWTH CHART
// =====================================================
async function viewGrowthChart(projectId) {
  try {
    const growthResponse = await axios.get(`${API_BASE}/api/projects/${projectId}/growth`)
    const projectResponse = await axios.get(`${API_BASE}/api/projects/${projectId}`)
    
    if (!growthResponse.data.success || !projectResponse.data.success) {
      showNotification('Failed to load growth data', 'error')
      return
    }
    
    const metrics = growthResponse.data.metrics
    const project = projectResponse.data.project
    
    if (metrics.length === 0) {
      showNotification('No growth data available yet', 'info')
      return
    }
    
    const modalHTML = `
      <div id="growth-chart-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
           onclick="if(event.target === this) closeModal('growth-chart-modal')">
        <div class="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold mb-1">Growth Metrics</h2>
                <p class="text-purple-100">${escapeHtml(project.name)} - Infinity Growth Loop Visualization</p>
              </div>
              <button onclick="closeModal('growth-chart-modal')" class="text-white hover:text-gray-200 text-2xl">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-150px)]">
            <div class="grid grid-cols-1 gap-6">
              <div class="bg-white p-4 rounded-xl border">
                <h3 class="text-lg font-bold mb-4 text-gray-800">Efficiency Growth</h3>
                <canvas id="efficiency-chart"></canvas>
              </div>
              <div class="bg-white p-4 rounded-xl border">
                <h3 class="text-lg font-bold mb-4 text-gray-800">Knowledge Accumulation</h3>
                <canvas id="knowledge-chart"></canvas>
              </div>
              <div class="bg-white p-4 rounded-xl border">
                <h3 class="text-lg font-bold mb-4 text-gray-800">Effective Output</h3>
                <canvas id="output-chart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modalHTML)
    
    // Load Chart.js dynamically
    if (!window.Chart) {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js'
      script.onload = () => renderGrowthCharts(metrics)
      document.head.appendChild(script)
    } else {
      renderGrowthCharts(metrics)
    }
  } catch (error) {
    console.error('Failed to load growth chart:', error)
    showNotification('Failed to load growth chart', 'error')
  }
}

// =====================================================
// RENDER GROWTH CHARTS
// =====================================================
function renderGrowthCharts(metrics) {
  const sessionNumbers = metrics.map(m => `Session #${m.session_number}`)
  const efficiencyData = metrics.map(m => (m.efficiency * 100).toFixed(1))
  const knowledgeData = metrics.map(m => m.knowledge_score.toFixed(2))
  const outputData = metrics.map(m => (m.effective_output).toFixed(1))
  
  // Efficiency Chart
  new Chart(document.getElementById('efficiency-chart'), {
    type: 'line',
    data: {
      labels: sessionNumbers,
      datasets: [{
        label: 'Efficiency (%)',
        data: efficiencyData,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        y: { beginAtZero: true, max: 100, title: { display: true, text: 'Efficiency (%)' }}
      }
    }
  })
  
  // Knowledge Chart
  new Chart(document.getElementById('knowledge-chart'), {
    type: 'line',
    data: {
      labels: sessionNumbers,
      datasets: [{
        label: 'Knowledge Score (x)',
        data: knowledgeData,
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Knowledge Multiplier' }}
      }
    }
  })
  
  // Output Chart
  new Chart(document.getElementById('output-chart'), {
    type: 'bar',
    data: {
      labels: sessionNumbers,
      datasets: [{
        label: 'Effective Output (credits)',
        data: outputData,
        backgroundColor: 'rgba(236, 72, 153, 0.7)',
        borderColor: 'rgb(236, 72, 153)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Effective Credits' }}
      }
    }
  })
}

// =====================================================
// CLOSE MODAL BY ID
// =====================================================
function closeModal(modalId) {
  const modal = document.getElementById(modalId || 'project-modal')
  if (modal) modal.remove()
}
