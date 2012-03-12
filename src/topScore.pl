#!/local/bin/perl

use CGI qw/:standard/;

$name = param('name');
$score = param('score');
  
#replace white spaces
$name =~ tr/ /_/;

$entry = $name . " " . $score;

#add new record to file
`echo $entry >> myfile`;

#sort records based on highest score
@records = `sort -r -n -k 2,2 myfile`;

print header,
      start_html('Top Scores');
print h1('Top Scores');

print "<table>";

foreach $i (0 .. $#records) {
    
  if ($records[$i] =~ m/(.+)\s(\d+)/) {
      print "<tr><td>$1</td><td>$2</td></tr>";
  }
   
}

print "</table>";
print end_html();