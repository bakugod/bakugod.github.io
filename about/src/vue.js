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
    console.log(json)
    this.items = json.map((repo) => ({
      name: repo.name,
      homepage: repo.homepage,
      show: false,
    }))
   }
});
