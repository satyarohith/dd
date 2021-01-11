import { getCardinal } from "https://deno.land/x/cardinal@0.1.0/mod.ts";
import { serve } from "https://deno.land/x/sift@0.1.1/mod.js";
import { getRandomCity } from "./cities.js";

async function getFormData(request) {
  const body = {};
  if (request.method === "POST") {
    if (request.headers.get("content-type").includes("form")) {
      const formData = await request.formData();
      for (const entry of formData.entries()) {
        const [key, value] = entry;
        body[key] = value;
      }
    }
  }
  return body;
}

async function handleRequest(request) {
  let slackResponse;
  const token = Deno.env.get("OPEN_WEATHER_TOKEN");
  if (!token) {
    return new Response(
      JSON.stringify({ error: "Environment key OPEN_WEATHER_TOKEN not set." }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    let url = `https://api.openweathermap.org/data/2.5/weather` +
      `?appid=${token}&units=metric`;
    const { text: location } = await getFormData(request);

    if (location) {
      url += `&q=${encodeURIComponent(location.trim().replace(/\s+/g, ""))}`;
    } else {
      url += `&id=${getRandomCity().id}`;
    }

    const response = await fetch(url);
    const {
      dt,
      name: city,
      sys,
      main: { humidity, temp, feels_like: feelsLike },
      wind: { speed: windSpeed, deg: windDegree },
      weather,
      visibility,
    } = await response.json();

    const windDirection = getCardinal(windDegree);
    const sunrise = new Date(sys.sunrise * 1000).toLocaleTimeString("en-US");
    const sunset = new Date(sys.sunset * 1000).toLocaleTimeString("en-US");
    const date = new Date(dt * 1000).toLocaleString("en-US");

    slackResponse = {
      response_type: "in_channel",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: [
              `*${temp}°C*\n`,
              `Feels like ${feelsLike}°C. ${weather[0].main}.`,
              `Wind: \`${windSpeed} m/s ${windDirection}\``,
              `Humidity: \`${humidity}%\` Visibility: \`${visibility /
                1000}km\``,
              `Sunrise: \`${sunrise}\` Sunset: \`${sunset}\``,
            ].join("\n"),
          },
          accessory: {
            type: "image",
            image_url: `https://openweathermap.org/img/wn/${
              weather[0].icon
            }@2x.png`,
            alt_text: weather[0].description,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `${date} ${city}, ${sys.country}`,
            },
          ],
        },
      ],
    };
  } catch (error) {
    console.error(error.message);
    slackResponse = {
      response_type: "ephemeral",
      text: "Error fetching the results. Please try after sometime.",
    };
  }

  return new Response(JSON.stringify(slackResponse), {
    headers: { "Content-Type": "application/json" },
  });
}

serve({
  "/": handleRequest,
});
