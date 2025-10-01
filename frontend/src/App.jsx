import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import './App.css'

function App() {
  const [socket, setSocket] = useState(null)
  const [polls, setPolls] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', '']
  })

  // Get API base URL
  const API_BASE = import.meta.env.PROD 
    ? '/api' 
    : 'http://localhost:3000/api'

  const SOCKET_URL = import.meta.env.PROD 
    ? window.location.origin 
    : 'http://localhost:3000'

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(SOCKET_URL)
    setSocket(newSocket)

    // Load existing polls
    fetchPolls()

    // Listen for real-time updates
    newSocket.on('pollCreated', (poll) => {
      setPolls(prev => [...prev, poll])
    })

    newSocket.on('pollUpdated', (updatedPoll) => {
      setPolls(prev => prev.map(poll => 
        poll.id === updatedPoll.id ? updatedPoll : poll
      ))
    })

    return () => newSocket.close()
  }, [])

  const fetchPolls = async () => {
    try {
      const response = await fetch(`${API_BASE}/polls`)
      const data = await response.json()
      setPolls(Object.values(data))
    } catch (error) {
      console.error('Error fetching polls:', error)
    }
  }

  const createPoll = async (e) => {
    e.preventDefault()
    
    if (!newPoll.question.trim() || newPoll.options.some(opt => !opt.trim())) {
      alert('Please fill in all fields')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/polls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: newPoll.question,
          options: newPoll.options.filter(opt => opt.trim())
        })
      })

      if (response.ok) {
        setNewPoll({ question: '', options: ['', ''] })
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Error creating poll:', error)
    }
  }

  const vote = async (pollId, optionId) => {
    try {
      await fetch(`${API_BASE}/polls/${pollId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ optionId })
      })
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const addOption = () => {
    setNewPoll(prev => ({
      ...prev,
      options: [...prev.options, '']
    }))
  }

  const updateOption = (index, value) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }))
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🗳️ Live Polling System</h1>
        <button 
          className="create-poll-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create New Poll'}
        </button>
      </header>

      <main className="app-main">
        {showCreateForm && (
          <div className="create-poll-form">
            <h2>Create New Poll</h2>
            <form onSubmit={createPoll}>
              <div className="form-group">
                <label>Question:</label>
                <input
                  type="text"
                  value={newPoll.question}
                  onChange={(e) => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Enter your poll question"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Options:</label>
                {newPoll.options.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                ))}
                <button type="button" onClick={addOption} className="add-option-btn">
                  + Add Option
                </button>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="submit-btn">Create Poll</button>
              </div>
            </form>
          </div>
        )}

        <div className="polls-container">
          {polls.length === 0 ? (
            <p className="no-polls">No polls available. Create one to get started!</p>
          ) : (
            polls.map(poll => (
              <div key={poll.id} className="poll-card">
                <h3>{poll.question}</h3>
                <div className="poll-options">
                  {poll.options.map(option => {
                    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0)
                    const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
                    
                    return (
                      <div key={option.id} className="poll-option">
                        <button
                          className="vote-btn"
                          onClick={() => vote(poll.id, option.id)}
                        >
                          {option.text}
                        </button>
                        <div className="vote-info">
                          <div 
                            className="vote-bar"
                            style={{ width: `${percentage}%` }}
                          ></div>
                          <span className="vote-count">
                            {option.votes} votes ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="poll-meta">
                  Total votes: {poll.options.reduce((sum, opt) => sum + opt.votes, 0)}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

export default App
