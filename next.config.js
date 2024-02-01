module.exports = {
    async redirects() {
      return [
        {
          source: '/api/story',
          destination: 'https://banny.eth.limo',
          permanent: false, // or true if the redirect is permanent
        },
      ]
    },
  }
  