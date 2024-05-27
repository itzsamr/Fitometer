$(document).ready(function () {
  const activityData = JSON.parse(localStorage.getItem("activityData")) || [];

  const updateGraph = () => {
    $("#contribution-bars").github_graph({
      data: activityData.map((activity) => ({
        timestamp: new Date(activity.date).getTime(),
        count: activity.duration,
      })),
    });
  };

  $("#activity-form").on("submit", function (e) {
    e.preventDefault();
    const date = $("#activity-date").val();
    const duration = parseInt($("#activity-duration").val());

    if (date && duration) {
      const existing = activityData.find((activity) => activity.date === date);
      if (existing) {
        existing.duration += duration;
      } else {
        activityData.push({ date, duration });
      }

      localStorage.setItem("activityData", JSON.stringify(activityData));
      updateGraph();
    }
  });

  $("#reset-button").on("click", function () {
    if (confirm("Are you sure you want to reset all data?")) {
      localStorage.removeItem("activityData");
      location.reload();
    }
  });

  $("#toggle-theme").on("click", function () {
    $("body").toggleClass("dark-theme");
  });

  updateGraph();
});
