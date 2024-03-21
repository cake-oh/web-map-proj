
## successful go 
library(raster)
library(rgdal)
library(RColorBrewer)

# Load the CSV data - PICK DIVERSITY OR CONFLICT
csv_data <- read.csv("output/data_diversity_longline_webmap.csv")
# csv_data <- read.csv("output/data_conflict_longline_webmap.csv")


# Create a raster from the CSV data
# diversity, abundance
# r <- rasterFromXYZ(csv_data[, c("lon", "lat", "fe_diversity_norm")], crs = CRS("+proj=longlat"))
csv_data$total_fe <- log(csv_data$total_fe+1)
r <- rasterFromXYZ(csv_data[, c("lon", "lat", "total_fe")], crs = CRS("+proj=longlat"))
# conflict
# r <- rasterFromXYZ(csv_data[, c("lon", "lat", "n_dyads")], crs = CRS("+proj=longlat"))


# Set the extent based on the desired geographic bounds
# extent(r) <- c(110, 270, -47, 50)  # Update with your data's actual extent if different
r_merc <- r
# Reproject the raster to Web Mercator
# r_merc <- projectRaster(r, crs=CRS("+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs"))

# Calculate aspect ratio
x_range <- abs(extent(r_merc)[1] - extent(r_merc)[2])
y_range <- abs(extent(r_merc)[3] - extent(r_merc)[4])
asp_ratio <- x_range / y_range

# Define PNG dimensions
png_width <- 2500  # Or another suitable width based on your needs
png_height <- png_width / asp_ratio

# Save the filled raster as a PNG file
# png("/Users/keikonomura/Library/Mobile Documents/com~apple~CloudDocs/PhD stuff/webmapping_project/data/pacific_ocean_raster_div.png",
# width=png_width, height=png_height,bg="transparent")
png("/Users/keikonomura/Library/Mobile Documents/com~apple~CloudDocs/PhD stuff/webmapping_project/data/pacific_ocean_raster_abundance.png",
    width=png_width, height=png_height,bg="transparent")
# png("/Users/keikonomura/Library/Mobile Documents/com~apple~CloudDocs/PhD stuff/webmapping_project/data/conflict_raster.png",
    # width=png_width, height=png_height,bg="transparent")
par(mar=c(0,0,0,0), xaxs='i', yaxs='i')
# plot(r_merc, axes=FALSE,bty="n", box=FALSE, col = brewer.pal(9,"Greens"),asp=1, legend=FALSE,useRaster=TRUE)  # Set useRaster=TRUE for large rasters
plot(r_merc, axes=FALSE,bty="n", box=FALSE, col = brewer.pal(9,"Oranges"),asp=1, legend=FALSE,useRaster=TRUE)  # Set useRaster=TRUE for large rasters
# plot(r_merc, axes=FALSE,bty="n", box=FALSE, col = rev(brewer.pal(9,"Blues")),asp=1, legend=FALSE,useRaster=TRUE)  # Set useRaster=TRUE for large rasters
# plot(r_merc, axes=FALSE, bty="n", box=FALSE, col = rev(brewer.pal(11,"Greys")),asp=1, legend=FALSE, useRaster=TRUE)
dev.off()

#








# for leaflet extents
# Get the extent of the raster
r_extent <- extent(r_filled)

# Print the extent (optional)
print(r_extent)


# Load the raster image
r <- raster("output.png")  # Replace with the path to your image


projection(r) <- CRS("+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs")
r <- projectRaster(r, crs = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs")

# Save the filled raster as a PNG file
pngfile <- "output.png"
png(file = pngfile)

# Set the plot margins to zero
par(mar = rep(0, 4))

# Plot the filled raster without a border
plot(r, legend = FALSE, mar=c(0,0,0,0), axes = FALSE, box = FALSE, main = "",asp=1)


dev.off()



# Get the bounds of the raster image
imageBounds <- extent(r)

# Convert the bounds to a matrix for Leaflet
imageBoundsMatrix <- matrix(c(imageBounds@xmin, imageBounds@ymin, imageBounds@xmax, imageBounds@ymax), ncol = 2)




#### previous tries ####
library(raster)

# Read CSV data into a data frame
df <- read.csv("output/data_diversity_longline.csv")

# Convert the data frame to a raster
r <- rasterFromXYZ(df[, c("lon", "lat", "fe_diversity_norm")])

# Fill missing values with '0'
r_filled <- reclassify(r, matrix(c(NA, NA, 0), ncol = 3))

# Reproject the raster
projection(r_filled) <- CRS("+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs")
r_filled <- projectRaster(r_filled, crs = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs")

# Save the filled raster as a PNG file
pngfile <- "output.png"
png(file = pngfile)

# Set the plot margins to zero
par(mar = c(0, 0, 0, 0), xaxs = "i", yaxs = "i")

# Plot the raster image
plot.new()
# rasterImage(r_filled, 95, 276, -52,55)
plot(r_filled, legend = FALSE, axes = FALSE, box = FALSE, main = "",asp=1)
dev.off()





## first go at it ##

library(raster)
library(rgdal) # For CRS and projectRaster
library(rasterVis) # for advanced visualization


# Read CSV data into a data frame
df <- read.csv("output/data_diversity_longline.csv")

# Convert the data frame to a raster
r <- rasterFromXYZ(df[, c("lon", "lat", "fe_diversity_norm")], crs="+proj=longlat +datum=WGS84")

# projection(r) <- CRS("+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs")
# r <- projectRaster(r, crs = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs")


# Fill missing values with '0'
r_filled <- reclassify(r, matrix(c(NA, NA, 0), ncol = 3))



# It's important to ensure the raster covers the exact area you need, without margins.
# Here, adjust extent if necessary to match your specific geographic bounds
extent(r_filled) <- extent(c(-60,110,60,270)) # Set your actual bounds

# Extract the min and max values for longitude and latitude from the extent
xmin <- extent(r_filled)@xmin
xmax <- extent(r_filled)@xmax
ymin <- extent(r_filled)@ymin
ymax <- extent(r_filled)@ymax

# Define a suitable color palette for your data
colorPalette <- terrain.colors(256)  # Feel free to choose another palette

# Plot the raster using the defined color palette
png(filename = "output.png")
par(mar=c(0,0,0,0), oma=c(0,0,0,0), xaxs="i", yaxs="i")  # Set margins to zero and adjust axis intervals
plot(r_filled, col=colorPalette, axes=FALSE, box=FALSE, ann=FALSE, legend=FALSE,
     xlim=c(xmin, xmax), ylim=c(ymin, ymax))
dev.off()