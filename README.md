# <img src="https://i.pinimg.com/originals/93/46/53/934653214719cf630e0f5cf9c746b364.png" align="left" width="30px" /> Spotify playlists

Simple yet not so professional github action that gets the playlists **created** by the logged user.

## How to use

1- Head to [Spotify developer dashboard](https://developer.spotify.com/dashboard/), create an app with a callback url of `http://localhost/callback` and save both `CLIENT_ID` and `CLIENT_SECRET`

2- Navigate to `https://accounts.spotify.com/authorize?client_id=YOUR_SPOTIFY_CLIENT_ID&response_type=code&scope=playlist-read-private,user-read-private&redirect_uri=http://localhost/callback/`

- This WILL fail, but you'll be redirected to `http://localhost/callback/?code=SOME_HUGE_CODE`... copy that huge code (`REFRESH_TOKEN`)

3- Go to your github profile -> your personal repo -> settings -> secrets

4- Add the `CLIENT_ID`, `CLIENT_SECRET` and `REFRESH_TOKEN` as secrets

5- Add this line in your README.md: `<!-- MY_PLAYLISTS:START--> <!-- MY_PLAYLISTS:END-->`

6- Create a folder called `.github/workflows`

7- Create a `yaml` file with this content:

```yaml
name: My spotify playlists
on:
  schedule:
    # Runs at midnight
    - cron: "0 0 * * *"
  workflow_dispatch:

jobs:
  update-readme-with-blog:
    name: Update this repo's README with my spotify playlists
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: nacho270/spotify-playlists-github-action@main
        env:
          SPOTIFY_SECRET_ID: ${{ secrets.SPOTIFY_SECRET_ID }}
          SPOTIFY_CLIENT_ID: ${{ secrets.SPOTIFY_CLIENT_ID }}
          SPOTIFY_REFRESH_TOKEN: ${{ secrets.SPOTIFY_REFRESH_TOKEN }}
```

8- This runs at midnight but you can run the action anytime you want through the `actions` tab of your repo.

### Big thanks to:

- [gautamkrishnar](https://github.com/gautamkrishnar) Who wrote [blog-post-workflow](https://github.com/gautamkrishnar/blog-post-workflow) which i used as my guide on this project
- [codeSTACKr](https://github.com/codeSTACKr) for [this](https://www.youtube.com/watch?v=ECuqb5Tv9qI) and [this](https://www.youtube.com/watch?v=n6d4KHSKqGk) video that helped me build [my profile page](https://github.com/nacho270/nacho270)
