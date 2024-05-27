//Format string
if (!String.prototype.formatString) {
  String.prototype.formatString = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
      return typeof args[number] != "undefined" ? args[number] : match;
    });
  };
}

(function ($) {
  $.fn.github_graph = function (options) {
    var prettyNumber = function (number) {
      return number < 10 ? "0" + number.toString() : number.toString();
    };

    var processListTimeStamp = function (list_timestamp) {
      obj_timestamp = {};
      for (var i = 0; i < list_timestamp.length; i++) {
        var _type = typeof list_timestamp[i];
        var _d =
          _type == "number"
            ? new Date(list_timestamp[i])
            : new Date(list_timestamp[i].timestamp);
        var display_date = getDisplayDate(_d);
        var increase = _type == "number" ? 1 : list_timestamp[i].count;
        if (!obj_timestamp[display_date]) {
          obj_timestamp[display_date] = increase;
        } else {
          obj_timestamp[display_date] += increase;
        }
      }
    };

    var getDisplayDate = function (date_obj) {
      var pretty_month = prettyNumber(date_obj.getMonth() + 1);
      var pretty_date = prettyNumber(date_obj.getDate());
      return "{0}-{1}-{2}".formatString(
        date_obj.getFullYear(),
        pretty_month,
        pretty_date
      );
    };

    var getCount = function (display_date) {
      return obj_timestamp[display_date] || 0;
    };

    var getColor = function (count) {
      if (typeof settings.colors[0] == "string") {
        return count > settings.colors.length - 1
          ? settings.colors[settings.colors.length - 1]
          : settings.colors[count];
      }
      const isLargeNumber = (element) => element.count > count;
      var i = settings.colors.findIndex(isLargeNumber);
      return i == -1
        ? settings.colors[settings.colors.length - 1].color
        : settings.colors[i - 1].color;
    };

    var start = function () {
      processListTimeStamp(settings.data);
      var wrap_chart = _this;
      settings.colors_length = settings.colors.length;
      var radius = settings.border.radius;
      var hoverColor = settings.border.hover_color;
      var clickCallback = settings.click;

      var start_date;
      if (settings.start_date == null) {
        start_date = new Date();
        start_date.setMonth(start_date.getMonth() - 12);
        start_date.setDate(start_date.getDate() + 1);
      } else {
        start_date = new Date(settings.start_date);
      }

      var end_date = new Date(start_date);
      end_date.setMonth(end_date.getMonth() + 12);
      end_date.setDate(end_date.getDate() - 1);

      var loop_html = "";
      var step = 13;
      var month_position = [{ month_index: start_date.getMonth(), x: 0 }];
      var using_month = start_date.getMonth();
      var week = 0;
      var g_x = week * step;
      var item_html = '<g transform="translate(' + g_x.toString() + ', 0)">';

      for (
        ;
        start_date.getTime() <= end_date.getTime();
        start_date.setDate(start_date.getDate() + 1)
      ) {
        if (start_date.getDay() == 0) {
          item_html = '<g transform="translate(' + g_x.toString() + ', 0)">';
        }

        var month_in_day = start_date.getMonth();
        var data_date = getDisplayDate(start_date);

        if (start_date.getDay() == 0 && month_in_day != using_month) {
          using_month = month_in_day;
          month_position.push({ month_index: using_month, x: g_x });
        }

        var count = getCount(data_date);
        var color = getColor(count);
        var y = start_date.getDay() * step;
        item_html +=
          '<rect class="day" width="11" height="11" y="' +
          y +
          '" fill="' +
          color +
          '" data-count="' +
          count +
          '" data-date="' +
          data_date +
          '" rx="' +
          radius +
          '" ry="' +
          radius +
          '"/>';

        if (start_date.getDay() == 6) {
          item_html += "</g>";
          loop_html += item_html;
          item_html = null;
          week++;
          g_x = week * step;
        }
      }

      if (item_html != null) {
        item_html += "</g>";
        loop_html += item_html;
      }

      if (month_position[1].x - month_position[0].x < 40) {
        month_position.shift(0);
      }

      for (var i = 0; i < month_position.length; i++) {
        var item = month_position[i];
        var month_name = settings.month_names[item.month_index];
        loop_html +=
          '<text x="' +
          item.x +
          '" y="-5" class="month">' +
          month_name +
          "</text>";
      }

      loop_html +=
        '<text text-anchor="middle" class="wday" dx="-10" dy="22">{0}</text>'.formatString(
          settings.h_days[0]
        ) +
        '<text text-anchor="middle" class="wday" dx="-10" dy="48">{0}</text>'.formatString(
          settings.h_days[1]
        ) +
        '<text text-anchor="middle" class="wday" dx="-10" dy="74">{0}</text>'.formatString(
          settings.h_days[2]
        );

      var wire_html =
        '<svg width="721" height="110" viewBox="0 0 721 110" class="js-calendar-graph-svg">' +
        '<g transform="translate(20, 20)">' +
        loop_html +
        "</g>" +
        "</svg>";

      wrap_chart.html(wire_html);

      $(_this)
        .find(".day")
        .on("click", function () {
          if (clickCallback) {
            clickCallback(
              $(this).attr("data-date"),
              parseInt($(this).attr("data-count"))
            );
          }
        });

      $(_this)
        .find(".day")
        .hover(
          function () {
            $(this).attr("style", "stroke-width: 1; stroke: " + hoverColor);
          },
          function () {
            $(this).attr("style", "stroke-width:0");
          }
        );

      _this.find("rect").on("mouseenter", mouseEnter);
      _this.find("rect").on("mouseleave", mouseLeave);
      appendTooltip();
    };

    var mouseLeave = function (evt) {
      $(".svg-tip").hide();
    };

    var mouseEnter = function (evt) {
      var target_offset = $(evt.target).offset();
      var count = $(evt.target).attr("data-count");
      var date = $(evt.target).attr("data-date");
      var count_text = count > 1 ? settings.texts[1] : settings.texts[0];
      var text = "{0} {1} on {2}".formatString(count, count_text, date);
      var svg_tip = $(".svg-tip").show();
      svg_tip.html(text);
      var svg_width = Math.round(svg_tip.width() / 2 + 5);
      var svg_height = svg_tip.height() * 2 + 10;
      svg_tip.css({ top: target_offset.top - svg_height - 5 });
      svg_tip.css({ left: target_offset.left - svg_width });
    };

    var appendTooltip = function () {
      if ($(".svg-tip").length == 0) {
        $("body").append(
          '<div class="svg-tip svg-tip-one-line" style="display:none"></div>'
        );
      }
    };

    var settings = $.extend(
      {
        colors: ["#eeeeee", "#d6e685", "#8cc665", "#44a340", "#44a340"],
        border: {
          radius: 2,
          hover_color: "#999",
        },
        click: null,
        start_date: null,
        month_names: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        h_days: ["M", "W", "F"],
        data: [],
      },
      options
    );

    var _this = $(this);
    start();
  };
})(jQuery);
