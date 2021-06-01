import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import * as videoAPI from 'api/videoAPI';
import { formatLikeCount } from 'helpers/format';
import useQuery from 'hooks/useQuery';
import React from 'react';
import useSWR from 'swr';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    iconBtn: {
      padding: '5px',
    },
    likeContainer: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
    },
    likeCountText: {
      fontWeight: 500,
    },
    tooltip: {
      margin: '0',
    },
    tooltipText: {
      fontSize: '12px',
    },
  });
});

const fetchVideoRating = async (url: string, videoId: string) => {
  try {
    const response = await videoAPI.getRating(videoId);
    return response.result.items![0];
  } catch (error) {
    // All errors will be handled at component
    error.result.error.message = 'An error occurred while getting rate video';
    throw error.result.error;
  }
};

export default React.memo(function LikeDisLike({
  videoData,
}: {
  videoData: gapi.client.youtube.Video;
}): JSX.Element {
  const classes = useStyles();
  const query = useQuery();
  const id = query.get('v') || '';
  const { data, error, isValidating, mutate } = useSWR(
    ['api/video/getRating', id],
    fetchVideoRating
  );

  const rating = data?.rating;
  const likeCount = videoData?.statistics?.likeCount;
  const dislikeCount = videoData?.statistics?.dislikeCount;

  const handleRate = async (type: string) => {
    if (!rating) return;

    try {
      await videoAPI.rating(id, type);
      mutate();
    } catch (error) {
      // console.log(error)
      alert('An error occurred while rating video');
    }
  };

  return (
    <Box display='flex' minWidth='135px'>
      <Tooltip
        className={classes.tooltip}
        title={<span className={classes.tooltipText}>Tôi thích video này</span>}
        placement='bottom'
      >
        <div className={classes.likeContainer}>
          {rating === 'like' ? (
            <IconButton
              onClick={() => handleRate('none')}
              className={classes.iconBtn}
              color='primary'
            >
              <ThumbUpIcon />
            </IconButton>
          ) : (
            <IconButton
              onClick={() => handleRate('like')}
              className={classes.iconBtn}
            >
              <ThumbUpIcon />
            </IconButton>
          )}
          <span className={classes.likeCountText}>
            {likeCount && formatLikeCount(likeCount)}
          </span>
        </div>
      </Tooltip>
      <Tooltip
        title={
          <span className={classes.tooltipText}>Tôi không thích video này</span>
        }
        placement='bottom'
      >
        <Box ml='15px' className={classes.likeContainer}>
          {rating === 'dislike' ? (
            <IconButton
              onClick={() => handleRate('none')}
              className={classes.iconBtn}
              color='primary'
            >
              <ThumbDownIcon />
            </IconButton>
          ) : (
            <IconButton
              onClick={() => handleRate('dislike')}
              className={classes.iconBtn}
            >
              <ThumbDownIcon />
            </IconButton>
          )}

          <span className={classes.likeCountText}>
            {dislikeCount && formatLikeCount(dislikeCount)}
          </span>
        </Box>
      </Tooltip>
    </Box>
  );
});
