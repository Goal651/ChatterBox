
//const productionServer='https://chatterbox-production-9404.up.railway.app'

export const webSocketUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3001':'https://chatterbox-production-9404.up.railway.app'
export const serverUrl = webSocketUrl + '/api'
export const vapidKey = 'BEFnyePPNoUMVOxzMQDy2J8OBmq7AHnks8vNchYeVcMrNOC21ZSuXqfl04fs6DPmUIBTgP9olyKehQgpfZcTqJ0'
