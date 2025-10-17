# Prompts

I provided the following prompts to Atlassian Rovo beta to generate this slop.

## Project setup

>Set up a basic build system for a TypeScript project.

and then

>Correct all warnings emitted during the build. Use other modules if it is
>necessary to resolve deprecation warnings.

## Main implementation

>The Transport for London (TfL) public transit organization offers a number of
>APIs to help query for routes, linestatus, stop/station status, etc. Some
>salient API endpoints include the following GET requests:
>
>https://api.tfl.gov.uk/Line/{line_ids}/Disruption
>
>Example: https://api.tfl.gov.uk/Line/metropolitan,bakerloo,lioness,elizabeth,112,206,224/Disruption
>
>where metropolitan, bakerloo, lioness and elizabeth are train lines and 112,
>206 and 224 are bus routes.
>
>Another relevant API endpoint takes the form
>
>https://api.tfl.gov.uk/StopPoint/{stop_point_ids}/Disruption
>
>Example: https://api.tfl.gov.uk/StopPoint/490008746N,490G00008463,490G00004297,490007753E,490013614W,490G00006858,490011818N,490007063K,490014384J/Disruption
>
>where the comma-separated list of identifiers is a list of bus stop identifiers
>("StopPoints" in the API's terminology).
>
>I will provide you a list of line identifiers and stop point identifiers that
>are relevant to this project. Write a client to query for disruptions to the
>lines and disruptions to the stop points whose identifiers I have supplied.
>Write a React-based web application to visualize these disruptions. I will
>provide you with routes that are combinations of lines, comprising many stop
>points. Organize the visualization by these routes.
>
>Routes:
>
>1. Bus 206 from Kingfisher Way to Wembley Park Station. Then Metropolitan Line
>   from Wembley Park Station to Baker Street. Then Metropolitan Line from Baker
>Street to Liverpool Street Station.
>2. Bus 206 or 224 from Kingfisher Way to Harlesden Station. Then Bakerloo Line
>   from Harlesden Station to Baker Street. Then Hammersmith and City Line or
>   Circle Line from Baker Street to Liverpool Street Station.
>3. Bus 112 from Normansmead to Haven Grn/Ealing Broadway Station. Then
>   Elizabeth Line from Ealing Broadway Station to Liverpool Street Station.
>
>Also provide disruption information about these routes in the opposite
>directions.
>
>Lines:
>
>The lines making up the routes above are:
>
>1. Metropolitan Line, TfL line identifier "metropolitan"
>2. Hammersmith and City Line, TfL line identifier "hammersmith-city"
>3. Circle Line, TfL line identifier "circle"
>4. Bakerloo Line, TfL line identifier "bakerloo"
>5. Elizabeth Line, TfL line identifier "elizabeth"
>6. Bus route 112, TfL line identifier "112"
>7. Bus route 206, TfL line identifier "206"
>8. Bus route 224, TfL line identifier "224"
>
>Stop points:
>
>For bus 206 from Kingfisher Way to Wembley Park Station, these are the relevant
>stop points:
>
>490G00008746:Kingfisher Way, 490G00008463:IKEA Brent Park/Drury Way,
>490G00004297:Brent Park Tesco, 490G00007753:Hannah Close,
>490G00013614:Third Way, 490G00006858:First Way, 490G00010593:Olympic Way,
>490G00011818:Rutherford Way, 490G00007063:Fulton Road, 490G00006565:Empire Way,
>490000257M:Wembley Park Station
>
>In the above comma-separated list, the stop point identifier is before the
>colon and the common name of the stop point is after the colon (and before the
>comma).
>
>For the Metropolitan Line from Wembley Park Station to Liverpool Street
>Station, these are the relevant stop points:
>
>940GZZLUWYP:Wembley Park, 940GZZLUFYR:Finchley Road, 940GZZLUBST:Baker Street,
>940GZZLUGPS:Great Portland Street, 940GZZLUESQ:Euston Square,
>940GZZLUKSX:King's Cross St. Pancras, 940GZZLUFCN:Farringdon,
>940GZZLUBBN:Barbican, 940GZZLUMGT:Moorgate, 940GZZLULVT:Liverpool Street
>
>The same stop points are relevant for the Hammersmith and City Line and the
>Circle Line from Baker Street to Liverpool Street Station.
>
>For bus 206 and bus 224 from Kingfisher Way to Harlesden Station, these are the
>relevant stop points:
>
>490G00008746:Kingfisher Way, 490G00013098:Swaminarayan Temple,
>490G00012018:Gloucester Close, 490G00006769:Fawood Avenue,
>490G00008865:Knatchbull Road, 490G00014798:Winchelsea Road/Harlesden Station,
>490000100S:Harlesden Station
>
>For the Bakerloo Line from Harlesden Station to Baker Street, these are the
>relevant stop points:
>
>940GZZLUSGP:Stonebridge Park, 940GZZLUHSN:Harlesden,
>940GZZLUWJN:Willesden Junction, 940GZZLUKSL:Kensal Green,
>940GZZLUQPS:Queen's Park, 940GZZLUKPK:Kilburn Park, 940GZZLUMVL:Maida Vale,
>940GZZLUWKA:Warwick Avenue, 940GZZLUPAC:Paddington, 940GZZLUERB:Edgware Road
>(Bakerloo Line), 940GZZLUMYB:Marylebone, 940GZZLUBST:Baker Street
>
>For bus 112 from Normansmead to Haven Grn/Ealing Broadway Station, these are
>the relevant stop points:
>
>490G00010313:Normansmead, 490G00005538:Conduit Way, 490G00007855:Harrow Road,
>490G00010347:Point Place, 490000224A:Stonebridge Park Station,
>490G00003914:Beresford Avenue, 490G00003029:Abbey Road,
>490G00008521:Iveagh Avenue, 490G00007696:Brentmead Gardens,
>490G00010751:Park Avenue, 490000099J:Hanger Lane Station,
>490G000904:Ashbourne Road, 490G00008210:Hillcrest Road,
>490G00003477:Audley Road, 490000158A:North Ealing Station,
>490G000376:Westbury Road, 490G000578:Haven Grn/Ealing Broadway Station
>
>For the Elizabeth Line from Ealing Broadway Station to Liverpool Street
>Station, these are the relevant stop points:
>
>910GEALINGB:Ealing Broadway, 910GACTONML:Acton Main Line,
>910GPADTLL:Paddington, 910GBONDST:Bond Street,
>910GTOTCTRD:Tottenham Court Road, 910GFRNDXR:Farringdon,
>910GLIVSTLL:Liverpool Street
>
>For the Metropolitan Line, Hammersmith and City Line, Circle Line,
>Bakerloo Line and Elizabeth Line, the stop points remain the same in both
>directions of travel.
>
>For bus 206 from Wembley Park Station to Kingfisher Way, these are the relevant
>stop points:
>
>490000257O:Wembley Park Station, 490G00006565:Empire Way, 490G00007063:Fulton
>Road, 490G00011818:Rutherford Way, 490G00010593:Olympic Way, 490G00006858:First
>Way, 490G00013614:Third Way, 490G00007753:Hannah Close, 490G00004297:Brent Park
>Tesco, 490G00008456:IKEA Brent Park, 490G00008746:Kingfisher Way
>
>Note that the bus stop points are different in this direction compared to the
>stop points in the opposite direction mentioned previously. In the case of this
>bus line, the stop points' common names are the same but the stop point
>identifiers can differ. In the case of other bus lines, the stop points and
>their common names may be significantly different in different directions of
>travel. Use only the stop points specified for each direction of travel.
>
>For bus 206 and bus 224 from Harlesden Station to Kingfisher Way, these are the
>relevant stop points:
>
>490000100N:Harlesden Station, 490G00014798:Winchelsea Road/Harlesden Station,
>490G00008865:Knatchbull Road, 490G00006769:Fawood Avenue,
>490G00012018:Gloucester Close, 490G00013098:Swaminarayan Temple,
>490G00008746:Kingfisher Way
>
>For bus 112 from Haven Grn/Ealing Broadway Station to Wrights Place (different
>stop point in this direction in place of Normansmead), these are the relevant
>stop points:
>
>490G000578:Haven Grn/Ealing Broadway Station, 490G000376:Westbury Road,
>490G000377:Hanger Lane, 490G00008210:Hillcrest Road, 490000099A:Hanger Lane
>Station, 490G000568:Hanger Lane Gyratory, 490G00010751:Park Avenue,
>490G00007696:Brentmead Gardens, 490G00008521:Iveagh Avenue, 490G00003029:Abbey
>Road, 490G00003914:Beresford Avenue, 490000224B:Stonebridge Park Station,
>490G00010347:Point Place, 490G00007855:Harrow Road, 490G00005538:Conduit Way,
>490G00014960:Wrights Place
>
>In order to use the responses from these API requests, you will need the API
>schema. You can find it for Line disruptions at
>
>https://api-portal.tfl.gov.uk/api-details#api=Line&operation=Line_DisruptionByPathIds
>
>and for StopPoint disruptions at
>https://api-portal.tfl.gov.uk/api-details#api=StopPoint&operation=StopPoint_DisruptionByPathIdsQueryGetFamilyQueryIncludeRouteBlockedStopsQuer
>
>First, write a MarkDown file called INSTRUCTIONS.md with all the information
>provided in this context and the instructions to generate the React web
>application to visualize disruptions by route for the routes mentioned above in
>both directions.
>
>Then consult the API specifications linked above and determine what the
>expected shape of responses is expected to be.
>
>Then implement failing tests and stubbed logic to fetch and process the
>disruption details for the Lines and StopPoints involved.
>
>Then implement the logic and make the failing tests pass as the logic is
>implemented.
>
>Then implement the React web application using the logic implemented
>previously.

Inevitably, Claude got the response shapes entirely wrong. I provided the
following hints.

>Examine the response to a GET request to the following URI to determine whether
>your modeling of the API response for the StopPoint Disruptions API endpoint is
>correct, and if it is incorrect, correct your modeling:
>
>https://api.tfl.gov.uk/StopPoint/490014520N,490014520S,490003818E/Disruption

It determined that the StopPoint Disruptions response was entirely incorrect
and proceeded to make changes. No idea if they actually work.

Then I followed up with

>Examine the response to a GET request to the following URI to determine whether
>your modeling of the API response for the Line Disruptions API endpoint is
>correct, and if it is incorrect, correct your modeling:
>
>https://api.tfl.gov.uk/Line/central,94/Disruption

It made further changes on the basis of that response.

Finally I followed up with

>Update INSTRUCTIONS.md with the details I have provided to you in the context,
>as well as the instructions I have provided to you in order to author the
>application and its tests.

It went through some file modification, and then I ran out of the 5 million
token quota for the day.

## Fixes

I had to use GitHub CoPilot with Claude Sonnet 3.5 to fix up the build and fix
build, linting and test errors. In particular, Rovo had referenced `LineInfo`
and not actually defined it. CoPilot did help put together a fleshed-out
structure definition for it after invoking the example API request to Line
Disruption, to its credit, once I added this file to its context. The older
model hallucinates a lot more with a much smaller context so fixing the linting
and test failure issues was a struggle, and I gave up and made the changes
myself.

I had to strip out the severity logic (which I never requested and which the
logic was attempting to derive by pattern matching on descriptions which is
exquisitely brittle). The tests attempting to cover that logic were amongst the
tests that were breaking.

GitHub CoPilot did help set up webpack as part of the build system with the
following prompt.

>Fix this error:
>
>```shell
>$ npm run dev
>
>> commute-disruption-visualizer@0.0.1 dev
>> ts-node src/index.ts
>
>/home/amitg/repos/commute-disruption-visualizer/src/components/DisruptionCard.css:1
>.disruption-card {
>^
>
>SyntaxError: Unexpected token '.'
>    at wrapSafe (node:internal/modules/cjs/loader:1472:18)
>    at Module._compile (node:internal/modules/cjs/loader:1501:20)
>    at Module._extensions..js (node:internal/modules/cjs/loader:1613:10)
>    at Object.require.extensions.<computed> [as .js] (/home/amitg/repos/commute-disruption-visualizer/node_modules/ts-node/src/index.ts:1608:43)
>    at Module.load (node:internal/modules/cjs/loader:1275:32)
>    at Function.Module._load (node:internal/modules/cjs/loader:1096:12)
>    at Module.require (node:internal/modules/cjs/loader:1298:19)
>    at require (node:internal/modules/helpers:182:18)
>    at Object.<anonymous> (/home/amitg/repos/commute-disruption-visualizer/src/components/DisruptionCard.tsx:3:1)
>    at Module._compile (node:internal/modules/cjs/loader:1529:14)
>```

I noticed that the Line Disruption API endpoint never provided stop identifiers
or line identifiers in its response, only unstructured textual information.
On the TfL tech forums I found a [thread](https://techforum.tfl.gov.uk/t/empty-affectedroutes-and-affectedstops/1756/5)
that discussed this problem, and found that the [Line Status API](https://api-portal.tfl.gov.uk/api-details#api=Line&operation=Line_StatusByIdsByPathIdsQueryDetail&definition=Tfl-19)
when requested with `?detail=true` does in fact return structured disruption
information with ATCO codes for affected stops and routes.

I prompted Rovo to first check both `atcoCode` and `stationAtcoCode`, as the
stop points mentioned in the earlier prompts were mostly station codes with a
few stop specific codes.

>Consult PROMPTS.md and INSTRUCTIONS.md for work done so far, as well as the API
>specifications and example API requests linked from those files. The
>implementation that maps stop point disruptions to the routes being monitored
>for disruption assumes that the stop points queried are present in the
>`atcoCode` part of the StopPoint Disruption API response. In reality, they
>could be in either `atcoCode` or `stationAtcoCode` as they are a mixture of
>station ATCO codes and stop ATCO codes. Revise the logic to
>
>1. propagate both the `atcoCode` and `stationAtcoCode` values from the TfL API
>   response shapes; and
>2. if the value is present in either, map the disruption to the corresponding
>   route.

Then it found using `jest` that tests were failing (this was due to me fixing
the batching used for the StopPoint Disruption API myself&mdash;the logic was
attempting to batch 50 at once even though in an earlier prompt I had said to
batch no more than 15 together). I prompted it to fix the failing tests:

>Use `npm run test` to ensure all tests are passing.

I asked it to revise `INSTRUCTIONS.md` accordingly.

>Revise INSTRUCTIONS.md based on the context in this session so far.

After this was revised I had Rovo use the Line Status API instead of the Line
Disruption API:

>Consult PROMPTS.md and INSTRUCTIONS.md for work done so far, as well as the
>API specifications and example API requests linked from those files. The
>implementation currently uses the Line Disruption API endpoint (GET request of
>the form https://api.tfl.gov.uk/Line/{ids}/Disruption ). The response to this
>API never populates affectedRoutes and affectedStops fields, so it is
>generally not possible to determine which lines and which StopPoints are
>affected.
>
>Entirely replace the use of the above mentioned API endpoint with the Line
>Status API endpoint instead. This API endpoint provides status of every
>StopPoint on the Line (including StopPoints not listed in PROMPTS.md or
>INSTRUCTIONS.md, and that are not relevant to monitoring the routes we are
>interested in). The GET request takes the form
>https://api.tfl.gov.uk/Line/{ids}/Status?detail=true -- and is documented at
>https://api-portal.tfl.gov.uk/api-details#api=Line&operation=Line_StatusByIdsByPathIdsQueryDetail
>-- the "detail=true" query parameter is very important. The response has an
>optional "disruptions" attribute that has the same schema as the Line
>Disruptions API endpoint that was previously mentioned, but this API response
>does populate affectedLines and affectedRoutes attributes within.
>
>In order to understand the response shape for the Line Status API endpoint,
>make a GET request to
>https://api.tfl.gov.uk/Line/bakerloo,94/Status?detail=true and examine the
>response.
>
>In your revised implementation, ensure that disruptions affecting any
>StopPoints, whether they are atcoCodes or stationAtcoCodes, that are not
>mentioned in the route breakdowns in PROMPTS.md or INSTRUCTIONS.md, are
>disregarded. Consider any Lines whose Status response does not include the
>`disruptions` attribute to not be disrupted. Only disruptions affecting the
>StopPoints mentioned in those files should be surfaced in the
>visualization. Ensure that batch requests limit the number of Lines and
>StopPoints in individual API requests to no more than 10.
>
>Also revise the tests to include a happy-case test with a response shape
>patterned after the Line Status response you get by calling the example API
>endpoint given above. Ensure that the test case covers disruptions only to
>non-relevant stop-points (expectation is that the route will show no
>disruptions), disruption to one relevant stop-point (expectation is that the
>route will show disruption to that stop-point as a disruption to the route),
>disruption to multiple relevant and non-relevant stop-points (expectation is
>that the route will show disruption to the relevant stop-points as a
>disruption to the route).
>
>Rework all tests based on the Line Disruption API to be based on the Line
>Status API instead.
>
>Revise INSTRUCTIONS.md based on the context in this session so far once the
>other changes are complete and `npm run lint` and `npm run test` pass.

It went through and followed the instructions, but I noticed that it was using
the `affectedStopPoints` shape but not considering the `affectedRoutes` shape,
while the real API response typically had an empty `affectedStopPoints`, while
`affectedRoutes` was populated.

The API shape definitions also had `any` types, attracting linter errors. I
prompted it to fix them.

>Linter errors are not acceptable. Correct all the linter errors.

and then prompted it, twice, to fix the logic:

>Your implementation considers only affectedStopPoints in the response shape
>and ignores affectedRoutes. If you examine the actual response you received
>for the Line Status example API endpoint I provided earlier in the session, you
>will see that affectedStopPoints is usually empty, and it is affectedRoutes
>that usually carries information about the StopPoints that are
>affected. Correct the implementation and tests to consider both
>affectedStopPoints and affectedRoutes in the Line Status API response in
>determining whether a given transit route is impacted by disruption to a Line.

which didn't fix things:

>Your derivation of `relevantLineDisruptions` does not appear to take into
>account the affectedRoutes field, am I mistaken?

at which point it actually corrected the implementation. I could see it was
prioritizing `affectedRoutes` over `affectedStopPoints`, which is incorrect,
even though in the actual API response, `affectedStopPoints` was typically
empty. Another prompt to do this:

>affectedStopPoints is more granular and therefore more specific than
>affectedRoutes, so if it is not empty, its contents should take precedence
>over the contents of affectedRoutes. 

I noticed it got a compilation error and decided to filter away fields with
unknown types. I was concerned it would do this to important fields that it was
using in its logic so prompted it to correct this if it was a problem.

>Examine your filtering of unknown types. Is it possible that the logic will
>always filter away fields that are useful to it because your definition of the
>interfaces has marked them as unknown? As a reminder, these fields come from
>an API response, and in your context, you have an example response, so it is
>not really necessary to define them as unknown. Check whether the logic is
>referencing any of these unknown fields, and if it is, and it is filtering
>away their contents first because they are typed as unknown, correct the type
>definitions.

It found the fields and did pattern matches against the source code to see where
they were used but before it could finish, I ran out of the 5m/day token
limit. But I think the fields are likely not used in the implementation anyway,
and the web application appears to be working.

I switched to GitHub CoPilot and prompted it to make further fixes, which it
did successfully.

>Examine all of the tests. Determine what each of the test implementations is
>actually testing. Compare this with the name of the test. If what the test is
>actually testing differs from what the name of the test suggests, revise the
>name of the test to reflect what the test implementation is actually testing.

Then

>Remove the Calculator implementation and test. They are not relevant to the
>functionality as described in PROMPTS.md and INSTRUCTIONS.md.

And

>Rewrite the README.md to indicate what this repository actually implements
>based on the content in PROMPTS.md and INSTRUCTIONS.md.

It didn't check to see if the project would still build correctly so I
prompted it to run the build again. It did succeed.

>Ensure that the project builds successfully with `npm run build`,
>that all tests pass using `npm run test` and that there are no
>linting errors or warnings reported by `npm run lint`.

## Grouping stops and lines for common descriptions

An artifact of how disruptions are reported via the API is that the same
disruption can affect multiple stops on a line. The application built so far
would present a card for each stop affected as well as the line itself. I
prompted Rovo to group together lines and stops impacted by the same disruption
description text.

>Read PROMPTS.md and INSTRUCTIONS.md for the full context. The disruption
>description is often the exact same text across multiple affected Lines and
>StopPoints. Group together the Lines and StopPoints affected by a given
>disruption description and present a single DisruptionCard by route for the
>group. For the start and end, present the minimum start date and maximum end
>date across the group of affected Lines and StopPoints with the exact same
>description text.

The LLM complied, but created a new React component for the grouped disruptions
instead of modifying the existing `DisruptionCard`. The result was unused
code. I prompted the LLM to remove unused code and dependencies serving only
the unused code:

>Ensure all tests are passing and ensure that there are no linting
>errors. Check for any unused React components and supporting code that is used
>only for those unused components, and remove them.

The LLM went through and removed the now unused React component and dependency
code (such as imports), and also found unused source from the initial
TypeScript project.

## Using Wembley Event Day information to indicate disruption to Wembley route

On Wembley event days, bus 206 is curtailed north of the Brent Park Tesco (T)
stop in the afternoon/evening. This means I can't get home from Wembley Park
Station in a straightforward manner, as the bus that would take me home from
the station doesn't come to the station (and in fact does not enter the Wembley
area). I set up nginx to proxy the event list API called via XHR from the
London Borough of Brent Council's website (because it isn't CORS-enabled) and
prompted Rovo to consume it to determine whether it is the afternoon or evening
of a Wembley Event Day, and show the inbound route via Wembley Park to be
disrupted if it is.

>Examine this API request carefully.
>
>```
>cr=$'\r'; curl --request POST --url https://gurdasani.com/brent-api/search/list --header 'accept: application/json' --header 'content-type: multipart/form-data; boundary=bucees' --data-binary @/dev/stdin <<EOF
>--bucees$cr
>Content-Disposition: form-data; name="searchQuery"$cr
>$cr
>{"search":"","facets":["brent_item_venue","brent_item_area","brent_item_date"],"filter":"(brent_item_venue/any(t: t eq 'Wembley Stadium')) and (template_1 eq '7bcaf87fb19f48e28b09754cfa20468d' or template_1 eq '672bebc02617450aa2e13d4ea5042a4d') and brent_item_has_layout and path_1/any(t:t eq '110d559fdea542ea9c1c8a5df7e70ef9')","orderBy":["brent_item_date"],"searchType":"Events","size":25,"orderDirection":"ASC"}$cr
>--bucees--$cr
>EOF
>```
>
>The cURL command is to execute a POST request to
>https://gurdasani.com/brent-api/search/list with a multipart/form-data body
>containing a single part with the name "searchQuery". This part contains a
>JSON payload. Note that each line in the request body must end with a carriage
>return and line feed. The `$cr` variable is set to the value of a carriage
>return, and the command line is executed on Linux, where a new line is just a
>line feed character. The request needs to be made precisely.
>
>Run this command and examine the response shape. It contains the schedule of
>upcoming Wembley event days. Note that the date of these events is included.
>
>If today is a Wembley event day, the inbound route from Liverpool Street to
>Kingfisher Way via Wembley Park Station will be disrupted from about 16:00
>until about 23:00. This is because on Wembley Event Days, bus 206 does not
>enter the Wembley area; its northernmost stop becomes Brent Park Tesco, and it
>does not serve stops at Wembley Park Station through Hannah Close at those
>times.
>
>Use this API request as an additional source of information that specifically
>the inbound direction of specifically the route involving bus 206 and the
>Metropolitan line, that is, the route from Liverpool Street Station to
>Kingfisher Way via Wembley Park Station, is disrupted. Add a disruption card
>showing the details of the ongoing event, if today is a Wembley Event Day. If
>today is not a Wembley Event Day according to the results of the API request,
>ignore the API response.
>
>Add tests ensuring that the API response is correctly parsed; that if the day
>is a Wembley Event Day; that the specified route captures it as a disruption;
>that if the day is not a Wembley Event Day, that no event in the API response
>is captured as a disruption to the specified route.
>
>Update INSTRUCTIONS.md with details the changes that you have made.

The LLM did the work, but didn't check for linting errors. Next prompt:

>Make sure all tests run via running the command `npm run test` pass and that
>there are no linting errors or warnings encountered via running the command
>`npm run lint`.

Examining the implementation, the LLM had done the work, but also ended up
trying to group together the Wembley Event Day disruptions with the TfL-sourced
disruptions. This would mean that the Wembley Event Day disruptions would be
displayed twice, which is undesirable. I prompted the LLM to keep the Wembley
Event Day disruptions separate from the TfL-sourced disruptions.

>Change and simplify the implementation so that Wembley Event Day based
>disruptions are not grouped alongside TfL sourced disruption information. The
>grouped disruptions must only consider disruptions sourced from the TfL Line
>Status API and the TfL StopPoint Disruptions API. Update the tests accordingly
>and update INSTRUCTIONS.md with the work you have done. Ensure that test runs
>via `npm run test` continue to pass and that there are no linting errors or
>warnings reported by `npm run lint`.

Examining the code, I found that the LLM had decided to just concatenate the
text making up each line of the multipart/form-data request body together, even
though they needed to be separate lines (using carriage return and line
feed). It took two prompts to get the LLM to fix this.

>When you join the lines for `formData`, you are effectively concatenating them
>together. Check your context: these are meant to be separate lines. The format
>of multipart/form-data is very prescriptive. Do not diverge at all from the
>format of the request as embodied in the cURL command I provided you. Update
>the tests accordingly, and add a test that tests the API request shape is
>correct. Ensure all tests pass and that there are no linting errors or
>warnings. Update INSTRUCTIONS.md accordingly.

and

>The last line of the request body also needs to end in a carriage return and
>line feed. Update the implementation and tests accordingly, ensure all tests
>pass, ensure there are no linting errors or warnings, and rework
>INSTRUCTIONS.md accordingly.

I then realized that the disruption starts earlier (usually around 14:45), and
prompted the LLM to consider the disruption to start from 13:00 onwards.

>Revise the time period on Wembley Event Days during which the route1-inbound
>is impacted to be 13:00 until 23:00. Update the tests accordingly. Ensure all
>tests are passing. Ensure there are no linting errors or warnings. Rework
>INSTRUCTIONS.md accordingly.
