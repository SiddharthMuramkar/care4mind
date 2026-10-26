# How the KarmaYoga Scale and Dosha Survey work now: research findings

Ticket: [How the KarmaYoga Scale and Dosha Survey work now](../issues/09-current-questionnaire-behaviour.md) · Researched 2026-10-26 · Branch: research/current-questionnaire-behaviour

## Summary

- **The KarmaYoga Scale runs on a paid edition of its quiz plugin, so its code isn't public.** A plugin is an add-on program for WordPress. The current site runs Quiz Maker 8.7.8, a premium release from 4 December 2023 that wordpress.org doesn't host. The figures below come from the quiz's own settings, which the page carries in encoded form, and from the free Quiz Maker's current public source. That source is the closest code anyone can read, but it isn't the code that runs.
- **The percentage can't be worked out from the public page.** The quiz is set to score "by points": the points a person earns, divided by the most points they could have earned, times 100. The points for each option and the weight of each question are stored only in the current site's database. The answer key decoded from the page flags one option per item, always the fifth of five. In the public code that flag isn't what gets added up when a quiz scores by points.
- **The page does contain result bands, which corrects current-site.md.** The encoded settings hold three bands: 0–35 "Not bad but not good either!", 36–75 "Good but still there is scope for improvement!" and 76–100 "Great! you are on right path. Continue to get the ultimate!"
- **The results screen** shows no "Your score is" line, because that line is switched off. It shows a progress bar that counts up to the percentage, a "Congratulations! You completed the quiz!" message followed by a leftover-looking "avg_res_by_cats:" line, probably the band message, "The average score is 65%" and a Restart quiz button. Nobody has finished the quiz to check this.
- **"The average score is 65%" is the rounded average of every stored result for this quiz.** It was computed when the cached copy of the page was built and stays fixed until the cache is rebuilt. Since it isn't 0%, results have been stored.
- **Finishing the KarmaYoga Scale stores a result** in the current site's database: the score, the points, every answer chosen, the start and end times and, unless a site-wide setting turns it off, the visitor's IP address (the network address of their connection). The quiz asks for no name or email.
- **The Dosha Survey can't calculate a result by itself.** It runs on WPForms Lite 2.0.3, which is the latest release. On Submit, a Lite form can do only one of three things: show a fixed message, show a page, or redirect to a web address. It does the same for everyone, because answer-dependent confirmations, calculations and quiz scoring are all paid add-ons. Each option's stored value is just its label text, and nothing in the page markup scores anything. Which of the three it does can only be seen by submitting the form or in its admin screens.
- **WPForms Lite keeps no entries in WordPress.** A submission can be emailed to the site admin, and it can be backed up to WPForms' own servers if someone turned that on. Whether either happens here isn't visible from outside.

## Findings

Both pages were fetched once each on 2026-10-26, seven seconds apart, as plain page HTML. Nothing was started, submitted or logged into. Both answers came from the site's page cache (a stored copy served to visitors). According to their `Date` headers, the KarmaYoga Scale copy was built at 05:58 UTC on 26 Oct 2026 and the Dosha Survey copy at 09:56 UTC on 25 Oct 2026 ([karmayoga-scale](https://care4mind.org/karmayoga-scale/), [dosha-survey](https://care4mind.org/dosha-survey/), read 2026-10-26).

### KarmaYoga Scale

#### What runs it

- **Plugin and quiz.** The post holds Quiz Maker quiz no. 3, titled "Karma Yoga Scale". Every Quiz Maker file on the page loads with `?ver=8.7.8`, and the quiz's settings record `"quiz_version":"8.7.8"` ([page](https://care4mind.org/karmayoga-scale/), read 2026-10-26).
- **8.7.8 is a paid release.** The free plugin on wordpress.org is numbered 6.x; its latest release is 6.7.1.95, from 23 Oct 2026 ([wordpress.org plugin API](https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request%5Bslug%5D=quiz-maker), read 2026-10-26). Its release archive (its SVN tags, the stored copy of each release on wordpress.org's code server) holds no 8.x version ([SVN tags](https://plugins.svn.wordpress.org/quiz-maker/tags/), read 2026-10-26). The vendor's own changelog lists "= 31.7.8 / 21.7.8 / 8.7.8 = (December 4, 2023)", one number for each paid tier ("Quiz Maker Business, Developer and Agency versions"). Its latest paid release is 8.8.8, from 16 Oct 2026 ([quiz-plugin.com changelog](https://quiz-plugin.com/changelog-for-quiz-maker/), [ays-pro.com changelog](https://ays-pro.com/changelog-for-quiz-maker-pro), read 2026-10-26). The changelog doesn't say which tier carries the 8.x number. Unlike WordPress, Elementor and Astra, this plugin is out of date on the current site.
- **When the quiz was last saved.** The quiz's settings record `"core_version":"6.4.2"`. Quiz Maker writes the WordPress version into a quiz's settings each time the quiz is saved ([quizzes list table, lines 1228–1230](https://plugins.svn.wordpress.org/quiz-maker/tags/6.7.1.95/includes/lists/class-quiz-maker-quizes-list-table.php), read 2026-10-26). WordPress 6.4.2 was current from 6 Dec 2023 until 6.4.3 came out on 30 Jan 2024 ([6.4.2 release post](https://wordpress.org/news/2023/12/wordpress-6-4-2-maintenance-security-release/), [6.4.3 release post](https://wordpress.org/news/2024/01/wordpress-6-4-3-maintenance-and-security-release/), read 2026-10-26). So the quiz settings were last saved on WordPress 6.4.2, most likely between those two dates. The quiz itself was created on 2023-11-29.
- **What the free source can and can't tell us.** The free plugin gained "Weight/Points calculation method for quizzes" in 6.7.1.92 (14 Oct 2026) and "Intervals functionality" in 6.7.1.93 (19 Oct 2026) ([README changelog, lines 440–449](https://plugins.svn.wordpress.org/quiz-maker/tags/6.7.1.95/README.txt), read 2026-10-26). Those are the two features this quiz depends on. So the free 6.7.1.95 code is the best public evidence of how they work, but the premium 8.7.8 code that actually runs may differ. Everything below that says "in the public code" carries that caveat.

#### Items, options and answer key

- **Structure.** A start screen ("Karma Yoga Scale", "Answer the following from your Everyday experience"), then four instruction screens, then 45 single-choice items with five options each, then a "See Result" button. No item is required (`data-required='false'`, `"make_questions_required":"off"`). Neither the items nor their options are shuffled (`"randomize_questions":"off"`, `"randomize_answers":"off"`), so every visitor sees the same order ([page](https://care4mind.org/karmayoga-scale/), read 2026-10-26).
- **How the answer key is written.** Each item is followed by a script line such as `window.quizOptions_3['15'] = 'eyJxdWVzdGlvbl9hbnN3ZXIi…'`. The text in quotes is base64, a reversible way of writing data as letters and digits; it isn't encryption. Decoded, it is JSON (a plain-text data format), for example `{"question_answer":{"63":"0","64":"0","65":"0","66":"0","67":"1"}}`: the option with answer id 67 ("Never") is flagged 1, the other four 0. The same flag appears a second time as a CSS class, `ays_anser_image_class`, on exactly the 45 flagged options. The hidden `ays_answer_correct[]` inputs are 0 for every option, so they carry nothing ([page](https://care4mind.org/karmayoga-scale/), read 2026-10-26). In the public code the `question_answer` line is commented out, and that class is added only when the address ends in `?ays_quiz_answers=error404` ([class-quiz-maker-public.php, lines 7258–7300](https://plugins.svn.wordpress.org/quiz-maker/tags/6.7.1.95/public/class-quiz-maker-public.php), read 2026-10-26). So the newer free code no longer puts the key in the page.
- **The flagged option is always the fifth of five.** Items 1–21 run Always → Never and flag Never (21 items). Items 22–31 and 41–45 run Strongly Disagree → Strongly Agree and flag Strongly Agree (15 items). Items 32–40 show the agreement scale reversed, Strongly Agree → Strongly Disagree, and flag Strongly Disagree (9 items). The counts match current-site.md.
- **The order visitors see isn't the stored order.** The stored question list interleaves the instruction screens with their sections: 58, 15–20, 23–28, 59, 57, 53–56, 52, 61, 21, 22, 13, 14, 29–33, 63, 34–47, 48–51. The page instead shows all four instruction screens first and then the items in groups: 15–22, 13, 14, then 23–33, 57, 53–56, 52, 48–51, 34–42 and 43–47 ([page](https://care4mind.org/karmayoga-scale/), read 2026-10-26).
  - The settings have `"enable_questions_ordering_by_cat":"on"`. In the public code that option groups questions by their question category and keeps the stored order inside each group ([class-quiz-maker-public.php, lines 979–1010](https://plugins.svn.wordpress.org/quiz-maker/tags/6.7.1.95/public/class-quiz-maker-public.php), read 2026-10-26). That is the likely cause.
  - The result: the "Everyday Experience - 2" and both "Work" instructions appear before item 1, away from the items they introduce. Work items 7–10 sit among the everyday items, and item 22 switches from the frequency scale to the agreement scale with no instruction in between.
  - The settings list six question-category ids (1, 3, 4, 5, 6, 7). The category names aren't in the page.
- **The four instruction screens**, in display order:
  - "Everyday Experience - 1": rate how frequently you have each experience.
  - "Everyday Experience - 2": rate agreement with statements about everyday experience.
  - "Experience Related to Work - 1": frequency, at the workplace.
  - "Experience Related to Work - 2": agreement, about work.

  The first three also ask the person to answer "according to what really reflects your experience rather than what you think your experience should be".

The 45 items as served, with their answer ids from the page:

| # | ID | Item | Options shown (in order) | Flagged option |
| --- | --- | --- | --- | --- |
| 1 | 15 | I cannot stop myself from eating delicious and tempting but unhealthy food. | Always → Never | Never (option 5 of 5) |
| 2 | 16 | I find it difficult to resist my temptations (like eating, drinking, etc.). | Always → Never | Never (option 5 of 5) |
| 3 | 17 | I tend to buy fancy products even if they are of little use to me. | Always → Never | Never (option 5 of 5) |
| 4 | 18 | I spend too much money on things which are not useful to me. | Always → Never | Never (option 5 of 5) |
| 5 | 19 | It makes me angry if I don’t get to eat my favourite cuisines. | Always → Never | Never (option 5 of 5) |
| 6 | 20 | When it is impossible to fulfil my temptation, I keep thinking about it. | Always → Never | Never (option 5 of 5) |
| 7 | 21 | I am unable to remain focused on my work for a long time and get easily carried away by other things. | Always → Never | Never (option 5 of 5) |
| 8 | 22 | Various temptations keep coming to my mind while I am working. | Always → Never | Never (option 5 of 5) |
| 9 | 13 | I am easily distracted during my work. | Always → Never | Never (option 5 of 5) |
| 10 | 14 | I find it difficult to concentrate on my work. | Always → Never | Never (option 5 of 5) |
| 11 | 23 | Unfavourable incidents disturb me immensely. | Always → Never | Never (option 5 of 5) |
| 12 | 24 | Failure makes me feel pessimistic. | Always → Never | Never (option 5 of 5) |
| 13 | 25 | Failure disturbs me internally. | Always → Never | Never (option 5 of 5) |
| 14 | 26 | While in stress, I find it difficult to differentiate between right and wrong. | Always → Never | Never (option 5 of 5) |
| 15 | 27 | During tough times, I generally take rash decisions. | Always → Never | Never (option 5 of 5) |
| 16 | 28 | When in tension, I cannot give a careful thought to the situation. | Always → Never | Never (option 5 of 5) |
| 17 | 29 | I feel extremely frustrated If I do not achieve my work targets. | Always → Never | Never (option 5 of 5) |
| 18 | 30 | I feel frustrated even if it s a small failure at work. | Always → Never | Never (option 5 of 5) |
| 19 | 31 | When emotionally disturbed at work, generally I don't make good decisions. | Always → Never | Never (option 5 of 5) |
| 20 | 32 | I am unable to think of alternatives, when I am under stress at work. | Always → Never | Never (option 5 of 5) |
| 21 | 33 | I find it difficult to look at the problem from different perspectives during stressful situations at work. | Always → Never | Never (option 5 of 5) |
| 22 | 57 | I see myself as a part of the natural system. | Strongly Disagree → Strongly Agree | Strongly Agree (option 5 of 5) |
| 23 | 53 | Whatever I do, I believe, has an impact on the larger social system. | Strongly Disagree → Strongly Agree | Strongly Agree (option 5 of 5) |
| 24 | 54 | I feel responsible towards the larger social system. | Strongly Disagree → Strongly Agree | Strongly Agree (option 5 of 5) |
| 25 | 55 | I feel that human beings, animals and trees are connected to each other. | Strongly Disagree → Strongly Agree | Strongly Agree (option 5 of 5) |
| 26 | 56 | I feel, all the living-beings in the nature are dependent on each other. | Strongly Disagree → Strongly Agree | Strongly Agree (option 5 of 5) |
| 27 | 52 | I see myself as a part of the larger social system. | Strongly Disagree → Strongly Agree | Strongly Agree (option 5 of 5) |
| 28 | 48 | I feel, my role in the society is a very essential part of my life. | Strongly Disagree → Strongly Agree | Strongly Agree (option 5 of 5) |
| 29 | 49 | I motivate my colleagues to take care of natural environment. | Strongly Disagree → Strongly Agree | Strongly Agree (option 5 of 5) |
| 30 | 50 | I try to convince my colleagues to become responsible towards nature and environment. | Strongly Disagree → Strongly Agree | Strongly Agree (option 5 of 5) |
| 31 | 51 | I try that my colleagues behave socially responsible. | Strongly Disagree → Strongly Agree | Strongly Agree (option 5 of 5) |
| 32 | 34 | I cherish the moments of results much more than the moments of efforts. | Strongly Agree → Strongly Disagree (reversed) | Strongly Disagree (option 5 of 5) |
| 33 | 35 | Desired results of my work are more important than efforts. | Strongly Agree → Strongly Disagree (reversed) | Strongly Disagree (option 5 of 5) |
| 34 | 36 | I insist on getting rewarded for my work at my desired time. | Strongly Agree → Strongly Disagree (reversed) | Strongly Disagree (option 5 of 5) |
| 35 | 37 | Getting credit of my work is extremely important for me. | Strongly Agree → Strongly Disagree (reversed) | Strongly Disagree (option 5 of 5) |
| 36 | 38 | When I do something well, I expect recognition from others. | Strongly Agree → Strongly Disagree (reversed) | Strongly Disagree (option 5 of 5) |
| 37 | 39 | While working, I keep thinking about what is in it for me. | Strongly Agree → Strongly Disagree (reversed) | Strongly Disagree (option 5 of 5) |
| 38 | 40 | I work only when I see that there is some personal benefit for me. | Strongly Agree → Strongly Disagree (reversed) | Strongly Disagree (option 5 of 5) |
| 39 | 41 | I cannot work, when I know that I will not get anything in return for myself. | Strongly Agree → Strongly Disagree (reversed) | Strongly Disagree (option 5 of 5) |
| 40 | 42 | When I am given a task, I first think about how I will benefit from it. | Strongly Agree → Strongly Disagree (reversed) | Strongly Disagree (option 5 of 5) |
| 41 | 43 | I experience joy in my work. | Strongly Disagree → Strongly Agree | Strongly Agree (option 5 of 5) |
| 42 | 44 | My spirit is energized by my work. | Strongly Disagree → Strongly Agree | Strongly Agree (option 5 of 5) |
| 43 | 45 | The work I do is connected with what I think is important in life. | Strongly Disagree → Strongly Agree | Strongly Agree (option 5 of 5) |
| 44 | 46 | My job helps me to understand my life’s purpose. | Strongly Disagree → Strongly Agree | Strongly Agree (option 5 of 5) |
| 45 | 47 | My work makes my life more meaningful. | Strongly Disagree → Strongly Agree | Strongly Agree (option 5 of 5) |

Item texts are copied exactly, including "even if it s a small failure" in item 18. The table was generated by a script from the saved page, not typed by hand.

#### How the percentage is computed

- **What the settings say.** The quiz's settings sit in a second encoded block, `aysQuizOptions['3']`. Decoded, they contain:
  - `"calculate_score":"by_points"`: score by points, not by counting correct answers.
  - `"display_score":"by_percentage"`: show the result as a percentage.
  - `"display_score_by":"by_percentage"`: match the result bands against the percentage.
  - `"hide_score":"on"`: hide the "Your score is" line.
  - `"pass_score":0`: no pass mark.

  ([page](https://care4mind.org/karmayoga-scale/), read 2026-10-26.)
- **The vendor's docs.** "Check the by correctness checkbox to calculate the final score by the percentage of the correct answers. Or check the by weight/points checkbox if you want the score to be calculated with the weight or points collected" ([Quiz Results Settings](https://quiz-plugin.com/docs/quiz-results-settings/), read 2026-10-26). Each option gets a "Weight/Point" in the question editor. "The Question Weight will be multiplied by the chosen answer weight (if you choose quiz calculation by points)", and "the default value for this option is 1" ([Create Question](https://quiz-plugin.com/docs/creating-questions/), read 2026-10-26).
- **The formula in the public code.** When someone finishes, the page sends their answers in the background to the server's `ays_finish_quiz` handler. That is called AJAX: the page talks to the server without reloading. The handler works out the score ([class-quiz-maker-public.php, lines 5957–6424](https://plugins.svn.wordpress.org/quiz-maker/tags/6.7.1.95/public/class-quiz-maker-public.php), read 2026-10-26). When scoring by points:
  - The points for an item are the stored points of the option the person chose (`check_answer_correctness`, lines 6891–6920). The flagged-correct field isn't used.
  - An item's maximum is the largest points value among its options (`get_answers_max_weight`, lines 6878–6889).
  - Each item's points and its maximum are multiplied by that item's weight (`get_question_weight`, lines 7703–7710).
  - Score = round(100 × total weighted points ÷ total weighted maximum, 2 decimals) (line 6418). Scoring by correctness instead takes the whole-number floor of the same ratio (line 6420).
- **Where the numbers live.** Option points are stored in the `aysquiz_answers` database table (column `weight`, default 0) and item weights in `aysquiz_questions` (column `weight`, default 1). A database table is like one spreadsheet tab inside the site's database ([class-quiz-maker-activator.php, lines 84–127](https://plugins.svn.wordpress.org/quiz-maker/tags/6.7.1.95/includes/class-quiz-maker-activator.php), read 2026-10-26). An option saved with no points entered gets 0 ([questions list table, lines 520 and 694](https://plugins.svn.wordpress.org/quiz-maker/tags/6.7.1.95/includes/lists/class-quiz-maker-questions-list-table.php), read 2026-10-26). Neither value appears anywhere in the page.
- **Skipped items count as zero.** Before sending, the page script adds an empty answer for every item left blank ([quiz-maker-public-ajax.js, lines 539–548](https://plugins.svn.wordpress.org/quiz-maker/tags/6.7.1.95/public/js/quiz-maker-public-ajax.js), read 2026-10-26). The server then gives that item 0 points but keeps its maximum in the total. Because no item is required, skipping lowers the percentage.
- **What this means.** The percentage can't be rebuilt from public data, because the points and weights are hidden. There are two broad possibilities, and only the client's database (or the client) can settle which is true:
  - If each flagged option has 1 point and the rest 0, the percentage is the share of items answered with the flagged (fifth) option.
  - If the options carry a graded ladder (for example 1 to 5, increasing towards the flagged option), the percentage reflects the average position chosen.

  Either way, the flag decoded from the page is not, on its own, the scoring rule. The flags may exist only because the editor requires one: "it is compulsory to tick any of the answer options as correct" ([Create Question](https://quiz-plugin.com/docs/creating-questions/), read 2026-10-26). Whether all points were left at 0 can't be ruled out from the page either. In that case the public code would give every finisher 0%, which the 65% average makes unlikely unless the scoring method was changed at some point.

#### What the results screen shows

The results area already in the page is `<div class='ays_score_message'></div><div class='ays_message'></div><p class='ays_average'>The average score is 65%</p>`, followed by a progress bar showing `0%` and a "Restart quiz" button. There is no "Your score is" line ([page](https://care4mind.org/karmayoga-scale/), read 2026-10-26). Read with the settings and the public code, the screen shows:

- **No "Your score is" line.** `"hide_score":"on"` removes it. The public code adds that line only when `hide_score` isn't on ([class-quiz-maker-public.php, line 2703](https://plugins.svn.wordpress.org/quiz-maker/tags/6.7.1.95/public/class-quiz-maker-public.php)). The docs say that with Hide score on "the users will not be able to see their scores after submitting the quiz" ([Quiz Results Settings](https://quiz-plugin.com/docs/quiz-results-settings/), read 2026-10-26).
- **The percentage on the progress bar.** `"enable_progress_bar":"on"`. The results script counts the bar's label up to the score as "N%" and grows the bar to match ([quiz-maker-public-ajax.js, lines 1753–2000](https://plugins.svn.wordpress.org/quiz-maker/tags/6.7.1.95/public/js/quiz-maker-public-ajax.js), read 2026-10-26). So despite Hide score, the number is shown, rounded down to a whole number.
- **A completion message.** The quiz's message after completion is set to "Congratulations!" / "You completed the quiz!" followed by the literal text `avg_res_by_cats: %%avg_res_by_cats%%`. `%%avg_res_by_cats%%` is a placeholder that "will calculate the average points gotten from the quiz questions for each question category" ([Message Variables](https://quiz-plugin.com/docs/message-variables/), read 2026-10-26). So visitors probably see the label "avg_res_by_cats:" followed by per-category averages. That label looks like a leftover.
- **Probably a band message.** Three bands are set (the `intervals` setting): 0–35 "Not bad but not good either!", 36–75 "Good but still there is scope for improvement!" and 76–100 "Great! you are on right path. Continue to get the ultimate!", with `"show_interval_message":"on"`.
  - In the public code a band matches when min ≤ score ≤ max, using the two-decimal score (lines 6497–6527). A by-points score between 35 and 36, or between 75 and 76 (say 35.56), would then match no band and show no band message.
  - The free 6.7.1.95 page has its own box for the band message (`ays_interval_message`, line 3543). The current site's page has none, so 8.7.8 shows the band some other way, possibly inside the completion message. Exactly how is unconfirmed.
- **The average line and a Restart quiz button** (`"enable_restart_button":"on"`).
- **Nothing else.** There is no per-question review or correct answers (`"enable_questions_result":"off"`, `"enable_correction":"off"`), no pass or fail message, no share buttons, no rating form, no name or email form (`"information_form":"disable"`), no certificate and no redirect (`"redirect_after_submit":"off"`, and the bands set no redirect address).

#### What "The average score is 65%" is computed from

- In the public code, when the page is built the server reads the average of the `score` column across every stored result for this quiz in the `aysquiz_reports` table, rounds it to a whole number and writes "The average score is N%" into the page ([class-quiz-maker-public.php, lines 2683–2693](https://plugins.svn.wordpress.org/quiz-maker/tags/6.7.1.95/public/class-quiz-maker-public.php), read 2026-10-26). The docs: "the statistical average of the results of the quiz will be shown on the Results page" ([Quiz Results Settings](https://quiz-plugin.com/docs/quiz-results-settings/), read 2026-10-26).
- So 65% is the rounded average of all stored attempts, including any test runs by site staff. It is baked into the cached page and doesn't change until the cache rebuilds. The copy fetched was built at 05:58 UTC on 26 Oct 2026. The script only reveals the line on the results screen; it doesn't recalculate it.
- In the public code the score is stored as a whole number (`'%d', // score`, line 7844).
- How many results are stored, and over what period, isn't visible. That the average isn't 0 shows at least one stored result with a score above zero.

#### Whether finishing the quiz stores anything

- **Yes, a result is stored.** `"disable_store_data":"off"` means results are kept. The docs describe the opposite setting: "After enabling this option, the data will not be stored in the database, and the results won't be shown" ([Quiz Results Settings](https://quiz-plugin.com/docs/quiz-results-settings/), read 2026-10-26).
- **What the row holds.** In the public code, each finish adds a row to the `aysquiz_reports` table ([class-quiz-maker-public.php, lines 6625–6733 and 7783–7859](https://plugins.svn.wordpress.org/quiz-maker/tags/6.7.1.95/public/class-quiz-maker-public.php), read 2026-10-26):
  - the quiz id and the WordPress user id (0 for an anonymous visitor)
  - name, email and phone, which stay empty here because the information form is off
  - the visitor's IP address, unless the plugin's site-wide "Do not store IP addresses" setting is on (line 6078)
  - start and end times and the duration
  - the score, points, maximum points, correct count and question count
  - every answer chosen, with per-item results
- **No limits are set.** There is no attempt limit (`"limit_users":"off"`), so no cookie is set and anyone can retake the quiz. Anonymous visitors can take it (`"enable_logged_users":"off"`).
- **Emails: probably none.** `"admin_mail":"off"` and `"user_mail":"off"`, while two admin-email options underneath are on (`"send_results_admin":"on"`, `"send_mail_to_site_admin":"on"`). Email is a paid feature, so its code isn't public. In the free plugin's greyed-out settings these options sit under a "Send Mail To Admin" switch ([quiz-maker-quizes-actions.php, around lines 10520–10590](https://plugins.svn.wordpress.org/quiz-maker/tags/6.7.1.95/admin/partials/quizes/actions/quiz-maker-quizes-actions.php), read 2026-10-26), which suggests no email goes out. Unconfirmed.
- **Finishing may fail on stale copies (untested).** The quiz form carries a WordPress nonce (`ays_finish_quiz_nonce_3`), a short-lived security token. "By default, a nonce has a lifetime of one day", and in practice it lasts about 12 to 24 hours. Logged-out visitors all share the same nonce ([WordPress nonces](https://developer.wordpress.org/apis/security/nonces/), read 2026-10-26). The public code rejects a finish whose nonce fails the check (lines 5961–5970), but it checks a field with a different name, so 8.7.8's behaviour is unknown. current-site.md notes cached pages up to about two days old. If 8.7.8 checks its token the same way, a visitor served an old copy could be refused at "See Result".

### Dosha Survey

#### What runs it

- WPForms Lite form no. 895, embedded through Elementor on page 899. Its files load with `?ver=2.0.3` ([page](https://care4mind.org/dosha-survey/), read 2026-10-26). 2.0.3 is the latest WPForms Lite; wordpress.org shows the plugin as last updated on 22 Oct 2026 ([wordpress.org plugin API](https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request%5Bslug%5D=wpforms-lite), read 2026-10-26). Its source was read from the wordpress.org release ([zip](https://downloads.wordpress.org/plugin/wpforms-lite.2.0.3.zip); files cited below from the [2.0.3 SVN tag](https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/), read 2026-10-26).

#### What a WPForms Lite form can show on submit

- **Three confirmation types.** Lite's settings offer "Message", "Show Page" and "Go to URL (Redirect)" ([lite/wpforms-lite.php, lines 533–543](https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/lite/wpforms-lite.php), read 2026-10-26). The docs: a message "will be displayed in place of the embedded form"; Show Page sends people "to another page on your site"; Go to URL can "send users to a different site" ([Setting Up Form Confirmations](https://wpforms.com/docs/setup-form-confirmation-wpforms/), updated Aug 24, 2026, read 2026-10-26). The code takes the same three paths after a submission ([includes/class-process.php, lines 1563–1655](https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/includes/class-process.php), read 2026-10-26).
- **The default message.** Unless someone changed it, the message is "Thanks for contacting us! We will be in touch with you shortly." ([includes/class-form.php, line 634](https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/includes/class-form.php); [lite/wpforms-lite.php, lines 491–496](https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/lite/wpforms-lite.php), read 2026-10-26).
- **Placeholders can repeat answers, not compute them.** The message can contain Smart Tags, placeholders that WPForms replaces with a value such as a submitted answer, for example `{field_id="3"}` ([Setting Up Form Confirmations](https://wpforms.com/docs/setup-form-confirmation-wpforms/), read 2026-10-26; [class-process.php, line 1833](https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/includes/class-process.php)). They can repeat what someone chose, but they can't add anything up.
- **A redirect can carry the answers elsewhere.** Smart Tags in a redirect address are filled in with the submitted values (lines 1604–1621). A redirect could therefore hand the answers to another site, such as the separate questionnaire app, in the address itself, and that site could do the scoring.
- **One outcome for everyone.** Lite has a single "Default Confirmation". Its "Add New Confirmation" button opens an upgrade prompt titled "Multiple confirmations" ([lite/wpforms-lite.php, lines 498–513](https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/lite/wpforms-lite.php), read 2026-10-26), and Lite's own tips say "You can have multiple confirmations with conditional logic" as an upgrade pitch ([DidYouKnow.php, line 74](https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/src/Lite/Admin/Education/Builder/DidYouKnow.php)). So every submitter gets the same message, page or redirect, whatever they answered.

#### Whether any calculation is possible

- **No, not in Lite.** Calculations is a separate add-on: "You'll need the Pro license level or higher to access the Calculations addon" ([Calculations Addon](https://wpforms.com/docs/calculations-addon/), updated Mar 10, 2025, read 2026-10-26). Lite 2.0.3 contains only the prompts that advertise it ([src/Admin/Education/Builder/Calculations.php](https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/src/Admin/Education/Builder/Calculations.php), read 2026-10-26).
- **Quiz scoring is paid too.** "Set correct answers and automatically score submissions" belongs to the Quiz Addon. Lite's prompt reads: "We're sorry, Enable Quiz is part of the Quiz Addon and not available on your plan. Please upgrade to the PRO plan" ([src/Admin/Education/Builder/Quiz.php, lines 102 and 171](https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/src/Admin/Education/Builder/Quiz.php), read 2026-10-26).
- **So any result would come from somewhere else.** With Lite alone, a Dosha result could only come from a page or site the confirmation sends people to. A fixed page would be the same for everyone; a redirect that carries the answers would leave the scoring to the other site.

#### What the form's settings in the page markup suggest

([page](https://care4mind.org/dosha-survey/), read 2026-10-26.)

- **It submits in the background.** The form tag has class `wpforms-ajax-form`, so answers go to the server without a page reload. WPForms adds that class when the form's "AJAX form submission" setting is on ([src/Frontend/Frontend.php, lines 278–279](https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/src/Frontend/Frontend.php)), and new blank forms have it on by default ([includes/templates/class-blank.php, line 60](https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/includes/templates/class-blank.php), read 2026-10-26). On success, the page script either goes to the address the server returns or shows the returned message in place of the form. So the confirmation is never in the page markup, and its type can't be read from it.
- **Nothing in it can score.** There are 12 required single-choice questions with three options each. Each option's stored value is exactly its label text, with no numbers. There are no number, hidden, total or calculation fields, and the words "confirmation", "redirect", "calculat" and "formula" don't appear anywhere in the page.
- **The rest is anti-spam and page details.** Besides the questions there is a honeypot text field labelled "you react What". A honeypot is a field hidden from people that only spam bots fill in. There are also hidden fields that send the page's title, address, the address the visitor came from and the page id with each submission, plus an anti-spam token. The button reads "Submit" and changes to "Sending..." while it works, both WPForms defaults.
- **The page explains nothing.** It holds only the heading "Dosha Survey" and the form: no purpose, no instructions and no result or interpretation text.
- **Reading.** All of this fits a form that collects answers and shows one confirmation. Nothing in the markup points to scoring, and nothing ties any option to Vata, Pitta or Kapha. Whether the confirmation is the default thank-you message, a page or a redirect (for example to `questionnaire.care4mind.org`) can only be found by submitting, which is ticket 27, or in the form's admin settings.

The 12 questions and options as served:

| # | Question (as labelled) | Option 1 | Option 2 | Option 3 |
| --- | --- | --- | --- | --- |
| 1 | Question 1: (Memory) Which of the following best describes your memory? | I have some difficulty remembering things | I have a good memory in general | I have a good memory, I can recall things others can’t |
| 2 | Question 2:(Concentration) How easy is it for you to focus on something for an extended period? | It is easy for me to get distracted | I focus when something is logical | I have no trouble concentrating |
| 3 | Question 3: (Changes to Plans) How do you react to sudden schedule changes? | I don’t get angry, I adapt easily | I don’t like it, but I adjust if logical | I don’t like changes to my plans |
| 4 | Question 4: (Appeal to Change) What convinces you to change your mind? | Overthinking & second-guessing | Someone logically convinces me | If a loved one asks me to reconsider |
| 5 | Question 5: (Storytelling Style) How do you tell stories? | My stories are detailed & wander into topics | I tell only the necessary details | I provide vivid descriptions |
| 6 | Question 6: (Work Style) How do you prefer to work? | Work in bursts of energy | Follow a proper schedule | Work at a consistent pace |
| 7 | Question 7: (Learning Style) How do you learn new things? | I get distracted often | I follow a strict routine | I start slow but pick up later |
| 8 | Question 8:(Dreams) How often do you dream? | Almost every night | Occasionally, but very vivid | Rarely, and they are slow & detailed |
| 9 | Question 9:( First Reaction to Something New) How do you react to a new or strange situation? | Fear & overthinking possible scenarios | I look for ways to prove myself | I resist and prefer things as they were |
| 10 | Question 10:(Leadership Style) How do you interact with a team? | I fit in with any group | I am tough but fair | I treat my team like family |
| 11 | Question 11:(Starting Something New) How easily do you start new projects? | I jump in with both feet | I need convincing first | I plan every detail before starting |
| 12 | Question 12:(Planning Style) How do you prefer to plan? | I figure things out as I go | I like structured planning | I take many opinions before deciding |

#### What a submission keeps (context for open question 8)

- **No entries in WordPress.** Lite's own settings text says so: "Your form entries are not being stored in WordPress, and your entry backups are not active". Its optional "Lite Connect" backup instead sends entries to WPForms' servers ("backed up remotely … Entry backups expire after 1 year") ([src/Lite/Integrations/LiteConnect/LiteConnect.php, lines 112–150](https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/src/Lite/Integrations/LiteConnect/LiteConnect.php), read 2026-10-26). Saving an entry in Lite only fires a hook that other code can listen for; Lite itself writes nothing ([class-process.php, lines 2231–2248](https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/includes/class-process.php)).
- **An email, if notifications are on.** A form's default notification emails `{admin_email}` with `{all_fields}`, which is every answer ([includes/class-form.php, lines 616–630](https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/includes/class-form.php), read 2026-10-26). Whether notifications are on for this form isn't visible.
- **Interaction tracking.** WPForms 2.0's "Form Analytics" script loads on the page (`analytics.min.js`). It is on by default and tracks everyone except staff who can publish posts, so anonymous visitors are tracked ([src/Analytics/Analytics.php, lines 43–75](https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/src/Analytics/Analytics.php), read 2026-10-26). It records per-session interaction snapshots in the site's database, such as focus, click, input and error counts and durations ([src/Analytics/Process.php](https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/src/Analytics/Process.php), read 2026-10-26). Whether those snapshots include answer values wasn't checked.

### Where this differs from current-site.md

- current-site.md says of the KarmaYoga Scale: "No result bands or interpretation text are in the HTML." They are there, but only inside the encoded `aysQuizOptions['3']` settings: three bands and their messages, plus the completion message.
- It also says "The results screen shows a percentage". The "Your score is" line is switched off; the percentage shows only on the progress bar.

This contradicts no ADR.

## Gaps and uncertainties

- **The 8.7.8 code isn't public.** Every "in the public code" point comes from free Quiz Maker 6.7.1.95, whose points scoring and bands arrived in October 2026. The paid 8.7.8 (December 2023) may differ: in rounding, in how bands with gaps match, in how the band message is shown, in nonce checks and in what it stores.
- **The points and weights are unknown.** Each option's points and each item's weight are only in the current site's database. Without them the percentage, and so the band, can't be reproduced. The client, by exporting the quiz or its questions, or someone with admin access, can supply them.
- **The question category names are unknown.** Six category ids are listed but not named, and the `%%avg_res_by_cats%%` line depends on them.
- **The results screen hasn't been seen.** How the completion message, the "avg_res_by_cats:" line and the band message actually render needs one real finish (ticket 27).
- **What a stored result holds isn't confirmed.** Whether IP addresses are kept depends on a site-wide setting nobody outside can see, and whether any email goes out is unconfirmed. How many results are stored, and whether they include test runs, is unknown; only the client can export them.
- **A stale nonce might block finishing.** Whether a cached page older than the nonce lifetime stops someone finishing is untested.
- **The Dosha Survey's confirmation is unknown.** Its type (message, page or redirect), its text, and whether notifications or Lite Connect are on can't be seen from outside. Whether the form was ever meant to hand off to the questionnaire app is unknown.
- **Page HTML can lag the database.** The page HTML came from cached copies built on 25 and 26 Oct 2026, and current-site.md notes the cache can lag the database. Neither questionnaire's settings are available through the REST API, so the cached HTML is the only public record.
- **Which paid tier is 8.x isn't known.** The changelog doesn't say whether 8.x is the Business, Developer or Agency edition.

## Sources

All read 2026-10-26.

**The current site** (one fetch each, page HTML only)

- KarmaYoga Scale page HTML, including the decoded `window.quizOptions_3` and `aysQuizOptions['3']`: https://care4mind.org/karmayoga-scale/
- Dosha Survey page HTML: https://care4mind.org/dosha-survey/

**Quiz Maker**

- wordpress.org plugin information API (latest free version 6.7.1.95): https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request%5Bslug%5D=quiz-maker
- wordpress.org SVN tags for Quiz Maker (no 8.x releases): https://plugins.svn.wordpress.org/quiz-maker/tags/
- Free Quiz Maker 6.7.1.95 release: https://downloads.wordpress.org/plugin/quiz-maker.6.7.1.95.zip. The files read are below; the SVN copies match the zip byte for byte where checked.
  - https://plugins.svn.wordpress.org/quiz-maker/tags/6.7.1.95/public/class-quiz-maker-public.php
  - https://plugins.svn.wordpress.org/quiz-maker/tags/6.7.1.95/public/js/quiz-maker-public-ajax.js
  - https://plugins.svn.wordpress.org/quiz-maker/tags/6.7.1.95/includes/class-quiz-maker-activator.php
  - https://plugins.svn.wordpress.org/quiz-maker/tags/6.7.1.95/includes/lists/class-quiz-maker-questions-list-table.php
  - https://plugins.svn.wordpress.org/quiz-maker/tags/6.7.1.95/includes/lists/class-quiz-maker-quizes-list-table.php
  - https://plugins.svn.wordpress.org/quiz-maker/tags/6.7.1.95/admin/partials/quizes/actions/quiz-maker-quizes-actions.php
  - https://plugins.svn.wordpress.org/quiz-maker/tags/6.7.1.95/README.txt
- Quiz Maker premium changelog (8.7.8 on 4 Dec 2023; 8.8.8 on 16 Oct 2026):
  - https://quiz-plugin.com/changelog-for-quiz-maker/
  - https://ays-pro.com/changelog-for-quiz-maker-pro
- Quiz Maker docs:
  - Quiz Results Settings: https://quiz-plugin.com/docs/quiz-results-settings/
  - Create Question: https://quiz-plugin.com/docs/creating-questions/
  - Message Variables: https://quiz-plugin.com/docs/message-variables/

**WPForms Lite**

- wordpress.org plugin information API (latest version 2.0.3): https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request%5Bslug%5D=wpforms-lite
- WPForms Lite 2.0.3 release: https://downloads.wordpress.org/plugin/wpforms-lite.2.0.3.zip. The files read are below:
  - https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/includes/class-process.php
  - https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/lite/wpforms-lite.php
  - https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/includes/class-form.php
  - https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/includes/templates/class-blank.php
  - https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/src/Frontend/Frontend.php
  - https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/src/Admin/Education/Builder/Quiz.php
  - https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/src/Admin/Education/Builder/Calculations.php
  - https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/src/Lite/Admin/Education/Builder/DidYouKnow.php
  - https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/src/Lite/Integrations/LiteConnect/LiteConnect.php
  - https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/src/Analytics/Analytics.php
  - https://plugins.svn.wordpress.org/wpforms-lite/tags/2.0.3/src/Analytics/Process.php
- WPForms docs:
  - Setting Up Form Confirmations: https://wpforms.com/docs/setup-form-confirmation-wpforms/
  - Calculations Addon: https://wpforms.com/docs/calculations-addon/

**WordPress**

- Nonces: https://developer.wordpress.org/apis/security/nonces/
- WordPress 6.4.2 release post: https://wordpress.org/news/2023/12/wordpress-6-4-2-maintenance-security-release/
- WordPress 6.4.3 release post: https://wordpress.org/news/2024/01/wordpress-6-4-3-maintenance-and-security-release/
