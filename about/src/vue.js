new Vue({
  el : '#App',
  data: () => ({
    url      : 'https://api.github.com/users/bakugod/repos',
    items    : [],
    timeout  : 1500,
  }),
  props: {
    msg: String
  },
  async mounted () {
    const response = await fetch(this.url)
    const json = await response.json()

    this.items = json.map((repo) => ({
      name: repo.name,
      link: repo.html_url,
      homepage: repo.homepage || null,
      show: false,
    }))
   this.items.forEach((repo, idx) => {  
        setTimeout(() => {
          repo.show = true
          setTimeout(() => {
            repo.show = false
          }, this.timeout + 100)
        }, this.timeout * idx)
      setInterval(() => {
      	setTimeout(() => {
          repo.show = true
          setTimeout(() => {
            repo.show = false
          }, this.timeout + 100)
        }, this.timeout * idx)
      }, this.items.length * this.timeout)
    })
   }
});