import React from "react";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import { BeatLoader } from "react-spinners";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import {
  getArtistFromId,
  selectFile,
  setItems,
  setMoreSearchResults,
  unsetFocusExplorer
} from "../../../actions/explorer";
import { openImage } from "../../../actions/images";
import { playTrack } from "../../../actions/playback";
import { AppState } from "../../../reducers";
import { SingleExplorerState } from "../../../reducers/explorer";
import { QueryState } from "../../../reducers/search-pagination";
import { selectSearch } from "../../../selectors/search";
import { blueTitleBar, greenSpotify } from "../../../styles/colors";
import { ACTION_TYPE, GenericFile, TrackFile } from "../../../types";
import {
  isAlbum,
  isArtist,
  isImage,
  isTrack
} from "../../../types/typecheckers";
import ContentLoading from "../../Reusables/ContentLoading";
import ExplorerFile from "../ExplorerFile";
import styles from "./styles";

const { container } = styles;

interface OwnProps {
  explorer: SingleExplorerState;
  selected: boolean;
  files: GenericFile[] | null;
}

interface StateProps {
  searchPagination: QueryState;
}

interface DispatchProps {
  selectFile(id: string): void;
  playTrack(file: TrackFile): void;
  getArtistInfo(id: string): void;
  unsetFocusExplorer(): void;
  openImage(
    image: string,
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): void;
  setItems(uriType: ACTION_TYPE, uri: string): void;
  setMoreSearchResults(type: string): void;
}

type Props = OwnProps & StateProps & DispatchProps;
class ContentWindow extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }
  doubleClickHandler(
    file: GenericFile,
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) {
    if (isTrack(file)) this.props.playTrack(file);
    if (isAlbum(file)) this.props.setItems(ACTION_TYPE.ALBUM, file.metaData.id);
    if (isArtist(file))
      this.props.setItems(ACTION_TYPE.ARTIST, file.metaData.id);
    if (isImage(file)) this.props.openImage(file.metaData.url, e);
  }

  renderFile(file: GenericFile) {
    const selected = this.props.explorer.selected === file.id;
    const getExtension = (type: string) => {
      if (type === "track") return ".mp3";
      if (type === "image") return ".jpg";
      return null;
    };
    return (
      <ExplorerFile
        key={file.id}
        file={file}
        selected={selected}
        onClick={() => this.props.selectFile(file.id)} // was -1 for image
        onDoubleClick={e => this.doubleClickHandler(file, e)}
      >
        {file.title}
        {getExtension(file.metaData.type)}
      </ExplorerFile>
    );
  }

  handleClickOutside(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if ((e as any).target.className === "explorer-items-container") {
      // e.preventDefault();
      this.props.unsetFocusExplorer();
    }
  }

  renderNoResults() {
    return <div style={styles.noResults}>No results found</div>;
  }

  renderSearchResults() {
    const { searchPagination } = this.props;

    const artists = this.props.files.filter(isArtist);
    const albums = this.props.files.filter(isAlbum);
    const tracks = this.props.files.filter(isTrack);
    const remainingArtists =
      searchPagination.artist.total - searchPagination.artist.current;
    const remainingAlbums =
      searchPagination.album.total - searchPagination.album.current;
    const remainingTracks =
      searchPagination.track.total - searchPagination.track.current;

    return (
      <div
        className="explorer-items-container"
        onMouseDown={e => this.handleClickOutside(e)}
        style={container}
      >
        {searchPagination.filter.types.includes("artist") && (
          <>
            {this.renderCategoryHeader("Artists")}
            {artists.map(file => this.renderFile(file))}
            {artists.length === 0 && this.renderNoResults()}
            {remainingArtists > 0 && (
              <div
                style={styles.moreButton}
                onClick={() => this.props.setMoreSearchResults("artist")}
              >
                {searchPagination.artist.loading ? (
                  <BeatLoader color={blueTitleBar} size={5} />
                ) : (
                  `${remainingArtists} more results...`
                )}
              </div>
            )}
            <div style={{ marginTop: 20 }} />
          </>
        )}
        {searchPagination.filter.types.includes("album") && (
          <>
            {this.renderCategoryHeader("Albums")}
            {albums.map(file => this.renderFile(file))}
            {albums.length === 0 && this.renderNoResults()}
            {remainingAlbums > 0 && (
              <div
                style={styles.moreButton}
                onClick={() => this.props.setMoreSearchResults("album")}
              >
                {searchPagination.album.loading ? (
                  <BeatLoader color={blueTitleBar} size={5} />
                ) : (
                  `${remainingAlbums} more results...`
                )}
              </div>
            )}
            <div style={{ marginTop: 20 }} />
          </>
        )}
        {searchPagination.filter.types.includes("track") && (
          <>
            {this.renderCategoryHeader("Tracks")}
            {tracks.map(file => this.renderFile(file))}
            {tracks.length === 0 && this.renderNoResults()}
            {remainingTracks > 0 && (
              <div
                style={styles.moreButton}
                onClick={() => this.props.setMoreSearchResults("track")}
              >
                {searchPagination.track.loading ? (
                  <BeatLoader color={blueTitleBar} size={5} />
                ) : (
                  `${remainingTracks} more results...`
                )}
              </div>
            )}
            <div style={{ marginTop: 10 }} />
          </>
        )}
      </div>
    );
  }

  renderCategoryHeader(text: string) {
    return (
      <div style={styles.searchCategory}>
        {text}
        <div style={styles.searchSeparator} />
      </div>
    );
  }

  render() {
    if (this.props.explorer.loading)
      return <ContentLoading color={greenSpotify} />;

    if (!this.props.files) return null;
    if (this.props.explorer.query) return this.renderSearchResults();
    return (
      <div
        className="explorer-items-container"
        onMouseDown={e => this.handleClickOutside(e)}
        style={container}
      >
        {this.props.files.map(file => this.renderFile(file))}
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, AppState> = (
  state: AppState,
  ownProps: OwnProps
) => ({
  searchPagination: selectSearch(state, ownProps)
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (
  dispatch: ThunkDispatch<AppState, null, Action>,
  ownProps: OwnProps
) => {
  const { id: explorerId } = ownProps.explorer;
  return {
    selectFile: (id: string) => {
      dispatch(selectFile(id, explorerId));
    },
    playTrack: (file: TrackFile) => {
      dispatch(playTrack(file));
    },
    getArtistInfo: (id: string) => {
      dispatch(getArtistFromId(id));
    },
    unsetFocusExplorer: () => dispatch(unsetFocusExplorer(explorerId)),
    openImage: (
      image: string,
      e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => dispatch(openImage(image, e)),
    setItems: (uriType: ACTION_TYPE, uri: string) =>
      dispatch(setItems(uriType, uri, explorerId)),
    setMoreSearchResults: (type: "album" | "artist" | "track") =>
      dispatch(setMoreSearchResults(type))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentWindow);