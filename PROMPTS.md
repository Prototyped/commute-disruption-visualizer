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

