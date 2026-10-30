# Pomodoro Art

A Pomodoro timer that shows you a painting from the Metropolitan Museum of Art in New York.

A Pomodoro timer is a countdown you use to focus on one thing for a set time. Here, the painting starts out very blurry and slowly gets clearer as the time counts down. When the timer reaches 00:00, the painting is fully sharp and you find out what it is.

## How it works

- **Start:** press **Start** and the timer counts down one second at a time. The default is 25 minutes (25:00).
- **Pause and Resume:** press **Pause** to freeze the timer. Press **Resume** to carry on from where it stopped. The painting stays as blurry as it was.
- **Reset:** press **Reset** to go back to 25:00. You keep the same painting, and it goes back to being very blurry.
- **Set your own length:** before you press Start, click the time (or the little pencil next to it) and type a new length, like `10:00`. Press Enter or click away to save it.
  - The shortest is 00:30 and the longest is 120:00.
  - If you type seconds above 59, they are added up for you. For example, `0:90` becomes `01:30`.
  - If the length doesn't work, you get a short message and the last good length is kept.
  - You can't change the length while the timer is running or paused.
- **Background tabs:** the timer checks the real clock, so the time left is still right if you switch to another tab and come back.
- **At 00:00:** the timer stops and the painting is fully sharp. The page now shows:
  - the painting's name
  - the artist
  - the year
  - a link, "Read about this painting", that opens the painting's page on the Met's website in a new tab
- **Restart session:** at 00:00 the Reset button is replaced by **Restart session**. Press it to go back to 25:00 with a brand new painting.

The name, artist, year and link are kept hidden until the timer finishes, so you can't peek at them early.

## Where the paintings come from

The paintings and their details come from the Met's free Collection API (an API is a way for a website to ask another website for information). You can read about it at [metmuseum.github.io](https://metmuseum.github.io/).

- **No API key needed.** The code doesn't use one.
- The page picks a random painting from the Met's European Paintings.
- It only uses paintings that are in the public domain and have an image.
- The artist, year and link are taken straight from the Met's record. If the Met has no artist or year, the page says "Unknown".

## When something goes wrong

- While a painting is loading, you will see "Loading painting…".
- If a painting has no image or can't be used, the page quietly tries another one. It tries up to 5 paintings.
- If the Met doesn't answer within 10 seconds, is offline, or sends an error, the page stops and shows a friendly message instead: "We couldn't load a painting right now. You can still use the timer. Refresh the page to try again."
- **The timer still works** even when no painting loads. At 00:00 there are just no painting details to show.
- To try again, refresh the page or press Restart session.

## Live link

[add live link here]

## Credits

- Paintings and painting details: the [Metropolitan Museum of Art](https://www.metmuseum.org/) and its free Collection API.
- Built by [your name].
