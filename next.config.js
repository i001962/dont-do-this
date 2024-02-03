module.exports = {
    async redirects() {
      return [
        {
          source: '/',
          destination: 'https://banny.eth.limo',
          permanent: false, // or true if the redirect is permanent
        }, 
      ]
    },
    images: {
      domains: ['banny.eth.limo'],
    },
  }
  