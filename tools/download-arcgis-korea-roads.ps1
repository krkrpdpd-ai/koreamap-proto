$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$outFile = Join-Path $root "data\geo\arcgis-korea-major-roads.geojson"
$baseUrl = "https://services-ap1.arcgis.com/iA7fZQOnjY9D67Zx/arcgis/rest/services/OSM_AS_Highways/FeatureServer/0/query"
$headers = @{ "User-Agent" = "Codex Korea map prototype" }

$where = "(highway in ('motorway','trunk','primary')) and (ref is not null)"
$geometry = "124.35,33.0,129.75,38.75"
$pageSize = 2000

function ConvertTo-QueryString($params) {
  $parts = foreach ($entry in $params.GetEnumerator()) {
    [Uri]::EscapeDataString($entry.Key) + "=" + [Uri]::EscapeDataString([string]$entry.Value)
  }
  return ($parts -join "&")
}

function New-QueryUri([int]$offset, [int]$count) {
  $params = [ordered]@{
    f = "geojson"
    where = $where
    outFields = "name,name_en,ref,highway,network,lanes,oneway,bridge,tunnel,Shape__Length,osm_id2,objectid"
    returnGeometry = "true"
    outSR = "4326"
    geometry = $geometry
    geometryType = "esriGeometryEnvelope"
    inSR = "4326"
    spatialRel = "esriSpatialRelIntersects"
    resultOffset = $offset
    resultRecordCount = $count
  }

  $query = ConvertTo-QueryString $params

  return "$baseUrl`?$query"
}

$countParams = [ordered]@{
  f = "json"
  where = $where
  returnCountOnly = "true"
  geometry = $geometry
  geometryType = "esriGeometryEnvelope"
  inSR = "4326"
  spatialRel = "esriSpatialRelIntersects"
}
$countUrl = $baseUrl + "?" + (ConvertTo-QueryString $countParams)

$countResponse = Invoke-WebRequest -Uri $countUrl -Headers $headers -UseBasicParsing
$total = (($countResponse.Content | ConvertFrom-Json).count)
if (-not $total) {
  throw "ArcGIS count query returned no count."
}

$features = New-Object System.Collections.Generic.List[object]
for ($offset = 0; $offset -lt $total; $offset += $pageSize) {
  $uri = New-QueryUri -offset $offset -count $pageSize
  $response = Invoke-WebRequest -Uri $uri -Headers $headers -UseBasicParsing
  $geojson = $response.Content | ConvertFrom-Json
  foreach ($feature in @($geojson.features)) {
    $features.Add($feature)
  }
  Write-Host ("Downloaded {0}/{1} road features" -f [Math]::Min($offset + $pageSize, $total), $total)
}

$collection = [ordered]@{
  type = "FeatureCollection"
  crs = [ordered]@{
    type = "name"
    properties = [ordered]@{ name = "EPSG:4326" }
  }
  properties = [ordered]@{
    source = "ArcGIS OSM Asia Highways FeatureServer"
    query = $where
    geometry = $geometry
    downloadedAt = (Get-Date).ToUniversalTime().ToString("o")
  }
  features = $features
}

$json = $collection | ConvertTo-Json -Depth 100 -Compress
[System.IO.File]::WriteAllText($outFile, $json, [System.Text.UTF8Encoding]::new($false))
Write-Host ("Wrote {0} features to {1}" -f $features.Count, $outFile)
