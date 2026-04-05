const fs = require('fs')
const path = require('path')

const logDir = path.join(__dirname, '../logs')
const logFile = path.join(logDir, 'error.log')

/**
 * Log an error to the error.log file or console
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
  
  // Console Logging (Always)
  console.error(`🚨 [${data.type || 'SERVER'}] ${data.message}`)

  try {
    // Ensure directory exists (Safe check every time for production stability)
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
    
    fs.appendFile(logFile, logMessage, (err) => {
      if (err) {
        // If file logging fails, we already have it in console/stdout
      }
    })
  } catch (err) {
    // If filesystem is read-only (common on some Render tiers), just fail silently
    // The error is already in the console/stdout which Render captures
  }
}

module.exports = { logError }
