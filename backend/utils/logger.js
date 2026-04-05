const fs = require('fs')
const path = require('path')

const logDir = path.join(__dirname, '../logs')
const logFile = path.join(logDir, 'error.log')

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

/**
 * Log an error to the error.log file
 * @param {Object} data - Information about the error
 */
const logError = (data) => {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] [${data.type || 'SERVER'}]
  Source: ${data.source || 'N/A'}
  Path: ${data.path || 'N/A'}
  Message: ${data.message || 'No message'}
  Stack: ${data.stack || 'No stack'}
  User: ${data.user ? JSON.stringify(data.user) : 'Guest'}
  ---
`
  
  fs.appendFile(logFile, logMessage, (err) => {
    if (err) console.error('Failed to write to error log:', err)
  })
}

module.exports = { logError }
